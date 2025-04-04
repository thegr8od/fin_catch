package com.finbattle.domain.room.service;

import static com.finbattle.domain.room.dto.RoomStatus.OPEN;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.game.dto.GameMemberStatus;
import com.finbattle.domain.game.model.GameData;
import com.finbattle.domain.game.repository.RedisGameRepository;
import com.finbattle.domain.game.service.GameService;
import com.finbattle.domain.member.model.Member;
import com.finbattle.domain.member.repository.MemberRepository;
import com.finbattle.domain.quiz.dto.EssayQuizDto;
import com.finbattle.domain.quiz.dto.MultipleChoiceQuizDto;
import com.finbattle.domain.quiz.dto.QuizOptionDto;
import com.finbattle.domain.quiz.dto.ShortAnswerQuizDto;
import com.finbattle.domain.quiz.model.EssayQuiz;
import com.finbattle.domain.quiz.model.MultipleChoiceQuiz;
import com.finbattle.domain.quiz.model.QuizOption;
import com.finbattle.domain.quiz.model.ShortAnswerQuiz;
import com.finbattle.domain.quiz.model.SubjectType;
import com.finbattle.domain.quiz.repository.EssayQuizRepository;
import com.finbattle.domain.quiz.repository.MultipleChoiceQuizRepository;
import com.finbattle.domain.quiz.repository.QuizOptionRepository;
import com.finbattle.domain.quiz.repository.ShortAnswerQuizRepository;
import com.finbattle.domain.room.dto.EventMessage;
import com.finbattle.domain.room.dto.MessageType;
import com.finbattle.domain.room.dto.PageResponse;
import com.finbattle.domain.room.dto.RedisRoomMember;
import com.finbattle.domain.room.dto.RoomCreateRequest;
import com.finbattle.domain.room.dto.RoomResponse;
import com.finbattle.domain.room.dto.RoomStatus;
import com.finbattle.domain.room.dto.RoomUpdateResponse;
import com.finbattle.domain.room.model.RedisRoom;
import com.finbattle.domain.room.model.Room;
import com.finbattle.domain.room.repository.RedisRoomRepository;
import com.finbattle.domain.room.repository.RoomRepository;
import com.finbattle.global.common.redis.RedisPublisher;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final MemberRepository memberRepository;
    private final RedisRoomRepository redisRoomRepository;
    private final EssayQuizRepository essayQuizRepository;
    private final ShortAnswerQuizRepository shortAnswerQuizRepository;
    private final RedisPublisher redisPublisher;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RedisGameRepository redisGameRepository;
    private final MultipleChoiceQuizRepository multipleChoiceQuizRepository;
    private final QuizOptionRepository quizOptionRepository;
    private final GameService gameService;

    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    // 방 생성
    public RoomResponse createRoom(Long memberId, RoomCreateRequest request) {
        // (1) Member 조회
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // (2) Room 엔티티 생성
        Room room = new Room();
        room.setRoomTitle(request.getRoomTitle());
        room.setPassword(request.getPassword());
        room.setMaxPlayer(request.getMaxPlayer());
        room.setRoomType(request.getRoomType());
        room.setStatus(OPEN); // 기본 상태
        room.setSubjectType(request.getSubjectType());

        // --- 1:N 핵심 ---
        // 방의 소유자(=호스트)를 Member로 직접 지정
        room.setHostMember(member);

        // DB 저장
        Room savedRoom = roomRepository.save(room);

        // (3) 응답 반환
        return mapToRoomResponse(savedRoom);
    }

    @Transactional
    public void startRoom(Long roomId, Long memberId) {
        // (1) Room / RedisRoom 변경
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다."));

        // 방장 체크 (예: 예외 처리)
        if (!room.getHostMember().getMemberId().equals(memberId)) {
            throw new IllegalStateException("방장만 게임 시작을 할 수 있습니다.");
        }

        room.setStatus(RoomStatus.IN_PROGRESS);
        roomRepository.save(room);

        RedisRoom redisRoom = redisRoomRepository.findById(roomId)
            .orElseThrow(() -> new IllegalArgumentException("Redis에 해당 방이 존재하지 않습니다."));
        redisRoom.setStatus(RoomStatus.IN_PROGRESS);
        redisRoomRepository.save(redisRoom);

        // (2) 방 멤버 목록 조회
        List<RedisRoomMember> members = redisRoom.getMembers();

        // (3) GameDataDto 생성
        GameData gameData = new GameData();
        gameData.setRoomId(roomId);
        gameData.setQuizNum(1);
        gameData.setCurrentQuizNum(0);
        gameData.setEssayCorrectedList(new ArrayList<>());

        // (3-1) GameMemberStatusList 구성
        List<GameMemberStatus> gameMemberStatusList = new ArrayList<>();
        for (RedisRoomMember member : members) {
            GameMemberStatus gms = new GameMemberStatus();
            gms.setLife(5);
            gms.setMemberId(member.getMemberId());
            gms.setMainCat(member.getMainCat());
            gms.setNickname(member.getNickname());
            // 필요 시 다른 필드 추가
            gameMemberStatusList.add(gms);
        }
        gameData.setGameMemberStatusList(gameMemberStatusList);

        // (3-2) 문제 정보 세팅
        // -> 객관식 5개, 단답식 3개, 서술형 1개
        SubjectType subject = room.getSubjectType();

        // 1) EssayQuiz (서술형) 1개
        List<EssayQuiz> essayList = essayQuizRepository.findRandomBySubject(
            subject, PageRequest.of(0, 1));
        if (essayList.isEmpty()) {
            throw new IllegalStateException("서술형 퀴즈가 부족합니다.");
        }
        EssayQuiz essayQuizEntity = essayList.get(0);
        // EssayQuizDto 변환 (직접 세팅 or toDto)
        EssayQuizDto essayQuizDto = EssayQuizDto.toDto(essayQuizEntity);
        gameData.setEssayQuiz(essayQuizDto);

        // 2) ShortAnswerQuiz (단답형) 3개
        List<ShortAnswerQuiz> shortEntities = shortAnswerQuizRepository.findRandomBySubject(
            subject, PageRequest.of(0, 3));
        List<ShortAnswerQuizDto> shortDtos = shortEntities.stream().map(entity -> {
            ShortAnswerQuizDto dto = ShortAnswerQuizDto.toDto(entity);
            return dto;
        }).toList();
        gameData.setShortAnswerQuizList(shortDtos);

        // 3) MultipleChoiceQuiz (객관식) 5개
        List<MultipleChoiceQuiz> multipleList = multipleChoiceQuizRepository.findRandomBySubject(
            subject, PageRequest.of(0, 5));
        // 각 객관식 문항에 대해 옵션을 조회한 뒤 DTO로 변환
        List<MultipleChoiceQuizDto> multipleDtos = multipleList.stream().map(mEntity -> {
            // 옵션 채워넣기
            List<QuizOption> options = quizOptionRepository.findByQuizId(mEntity.getQuizId());
            List<QuizOptionDto> optionDtos = QuizOptionDto.toDtoList(options);

            MultipleChoiceQuizDto dto = MultipleChoiceQuizDto.toDto(mEntity);
            dto.setQuizOptions(optionDtos);

            return dto;
        }).toList();
        gameData.setMultipleChoiceQuizList(multipleDtos);

        // (4) Redis 저장 (DTO 자체를)
        // 아래는 예시로 CrudRepository<GameDataDto, Long>를 사용한다고 가정
        // (직접 RedisTemplate을 쓸 수도 있음)
        redisGameRepository.save(gameData);

        // (5) 시작 이벤트 발행
        EventMessage<List<GameMemberStatus>> eventMessage = new EventMessage<>(MessageType.START,
            roomId,
            gameMemberStatusList);
        try {
            String jsonMessage = objectMapper.writeValueAsString(eventMessage);
            redisPublisher.publish("room:" + roomId, jsonMessage);
        } catch (JsonProcessingException e) {
            log.error("RedisRoom START 이벤트 직렬화 실패", e);
            throw new IllegalStateException("이벤트 메시지 생성 중 오류가 발생했습니다.");
        }

        scheduler.schedule(() -> {
            try {
                // 원하는 gameService의 메서드 호출
                gameService.startAutoGame(roomId);
            } catch (Exception e) {
                log.error("게임 시작(3초 지연) 중 오류 발생 roomId={}", roomId, e);
            }
        }, 3, TimeUnit.SECONDS);
    }

    public PageResponse getRoomsByType(SubjectType subjectType, Integer page) {
        PageRequest pageRequest = PageRequest.of(page - 1, 20);

        Page<Room> roomPage = roomRepository.findBySubjectTypeAndStatusOrderByUpdateAtDesc(
            subjectType, RoomStatus.OPEN,
            pageRequest);

        return processPageResponse(roomPage);
    }

    @Transactional
    public RoomUpdateResponse updateRoomActivityTime(Long roomId, Long memberId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new IllegalArgumentException("해당 방이 존재하지 않습니다."));

        // 1. 방 상태 확인
        if (room.getStatus() != RoomStatus.OPEN) {
            throw new IllegalStateException("방이 열려있지 않습니다.");
        }

        // 2. 요청자가 방장인지 확인
        if (!room.getHostMember().getMemberId().equals(memberId)) {
            throw new IllegalStateException("방장만 방을 갱신할 수 있습니다.");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextUpdateAt = room.getUpdateAt().plusMinutes(1);

        if (nextUpdateAt.isAfter(now)) {
            long secondsLeft = java.time.Duration.between(now, nextUpdateAt).getSeconds();
            log.info("⏳ 아직 {}초 남음", secondsLeft);
            return new RoomUpdateResponse(false, secondsLeft);
        }

        // 3. updateAt 갱신
        room.setUpdateAt(now);
        roomRepository.save(room);
        log.info("✅ 방 {}의 updateAt을 최신화함", roomId);
        return new RoomUpdateResponse(true, 0);
    }

    // OPEN 상태의 방만 가져오기
    public PageResponse getOpenRooms(Integer page) {
        PageRequest pageRequest = PageRequest.of(page - 1, 20);

        Page<Room> roomPage = roomRepository.findByStatusOrderByUpdateAtDesc(RoomStatus.OPEN,
            pageRequest);

        return processPageResponse(roomPage);
    }

    private PageResponse processPageResponse(Page<Room> roomPage) {
        List<RoomResponse> roomResponses = roomPage.getContent().stream()
            .map(room -> {
                RedisRoom redisRoom = redisRoomRepository.findById(room.getRoomId()).orElse(null);
                return RoomResponse.fromEntity(room, redisRoom);
            })
            .toList();

        return new PageResponse(
            roomResponses,
            roomPage.getNumber() + 1,  // 1-based로 보정
            roomPage.getSize(),
            roomPage.getTotalPages(),
            roomPage.getTotalElements(),
            roomPage.isLast()
        );
    }

    // 예시: 방장이 방을 나갈 시 새 방장을 지정하는 로직이 필요하다면
    // Room 엔티티 안에 "hostMember"만 존재하므로, 새 호스트를 어떻게 정할지 별도 설계가 필요함.

    private RoomResponse mapToRoomResponse(Room room) {
        RoomResponse response = new RoomResponse();
        response.setRoomId(room.getRoomId());
        response.setRoomTitle(room.getRoomTitle());
        response.setStatus(room.getStatus());
        response.setRoomType(room.getRoomType());
        response.setMaxPlayer(room.getMaxPlayer());
        response.setCreatedAt(room.getCreatedAt());
        response.setSubjectType(room.getSubjectType());
        response.setMemberId(room.getHostMember().getMemberId());
        return response;
    }
}
