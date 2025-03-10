import React, { useRef, useEffect, useState } from "react";
import * as PIXI from "pixi.js";

/**
 * 이미지 캐시 객체
 * 이미지를 메모리에 캐싱하여 중복 로드 방지 및 성능 최적화
 */
const imageCache: Record<string, HTMLImageElement> = {};

/**
 * 이미지 사전 로딩 함수
 * 단일 이미지를 로드하고 캐싱하는 유틸리티 함수
 *
 * @param {string} src - 로드할 이미지 경로
 * @returns {Promise<HTMLImageElement>} - 로드된 이미지 객체를 포함한 Promise
 */
const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    // 이미 캐시에 있으면 바로 반환
    if (imageCache[src]) {
      resolve(imageCache[src]);
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageCache[src] = img; // 이미지를 캐시에 저장
      resolve(img);
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

/**
 * 스프라이트 애니메이션 컴포넌트 Props 인터페이스
 *
 * @property {boolean} isPlaying - 애니메이션 재생 여부
 * @property {string} spriteSheet - 스프라이트 시트 이미지 경로
 * @property {number} frameWidth - 각 프레임의 너비(픽셀)
 * @property {number} frameHeight - 각 프레임의 높이(픽셀)
 * @property {number} frameCount - 총 프레임 수
 * @property {number} animationSpeed - 애니메이션 속도 (기본값: 0.2)
 * @property {function} onAnimationComplete - 애니메이션 완료 시 호출될 콜백 함수
 * @property {function} onHitLeft - 왼쪽 캐릭터에 부딪혔을 때 호출될 함수
 * @property {function} onHitRight - 오른쪽 캐릭터에 부딪혔을 때 호출될 함수
 * @property {boolean} direction - 애니메이션 방향 (true: 왼쪽→오른쪽, false: 오른쪽→왼쪽)
 * @property {number} width - 애니메이션 컨테이너 너비
 * @property {number} height - 애니메이션 컨테이너 높이
 * @property {boolean} horizontal - 스프라이트 시트 레이아웃 (true: 가로 배열, false: 세로 배열)
 * @property {number} rows - 스프라이트 시트의 행 수 (세로 배열일 때 사용)
 * @property {number} columns - 스프라이트 시트의 열 수 (가로 배열일 때 사용)
 * @property {boolean} loop - 애니메이션 반복 여부
 * @property {boolean} moving - 이동 애니메이션 여부 (false일 경우 제자리 애니메이션)
 */
interface SpriteAnimationProps {
  isPlaying: boolean;
  spriteSheet: string; // 스프라이트 시트 이미지 경로
  frameWidth: number; // 각 프레임의 너비
  frameHeight: number; // 각 프레임의 높이
  frameCount: number; // 총 프레임 수
  animationSpeed?: number; // 애니메이션 속도 (기본값: 0.2)
  onAnimationComplete?: () => void;
  // 충돌 감지를 위한 추가 속성
  onHitLeft?: () => void; // 왼쪽 캐릭터에 부딪혔을 때 호출될 함수
  onHitRight?: () => void; // 오른쪽 캐릭터에 부딪혔을 때 호출될 함수
  // 애니메이션 방향 (true: 왼쪽에서 오른쪽, false: 오른쪽에서 왼쪽)
  direction?: boolean;
  // 애니메이션 크기 설정
  width?: number;
  height?: number;
  // 스프라이트 시트 레이아웃 (true: 가로 배열, false: 세로 배열)
  horizontal?: boolean;
  // 스프라이트 시트의 행 수 (세로 배열일 때 사용)
  rows?: number;
  // 스프라이트 시트의 열 수 (가로 배열일 때 사용)
  columns?: number;
  // 애니메이션 반복 여부
  loop?: boolean;
  // 이동 애니메이션 여부 (false일 경우 제자리 애니메이션)
  moving?: boolean;
}

/**
 * 스프라이트 시트 기반 애니메이션 컴포넌트
 * PixiJS를 사용하여 스프라이트 시트 애니메이션을 렌더링
 *
 * @param {SpriteAnimationProps} props - 스프라이트 애니메이션 컴포넌트 props
 * @returns {JSX.Element} - 스프라이트 애니메이션 컴포넌트
 */
const SpriteAnimation: React.FC<SpriteAnimationProps> = ({
  isPlaying,
  spriteSheet,
  frameWidth,
  frameHeight,
  frameCount,
  animationSpeed = 0.2,
  onAnimationComplete,
  onHitLeft,
  onHitRight,
  direction = true, // 기본값은 왼쪽에서 오른쪽
  width = 800,
  height = 600,
  horizontal = true, // 기본값은 가로 배열
  rows = 1,
  columns = 0, // 0이면 자동 계산
  loop = false, // 기본값은 반복 안 함
  moving = false, // 기본값은 제자리 애니메이션
}) => {
  // 컨테이너 참조
  const containerRef = useRef<HTMLDivElement>(null);
  // PixiJS 앱 참조
  const appRef = useRef<PIXI.Application | null>(null);
  // 애니메이션 참조
  const animationRef = useRef<PIXI.AnimatedSprite | null>(null);
  // 초기화 여부 참조
  const initializedRef = useRef<boolean>(false);
  // 재생 상태 참조
  const isPlayingRef = useRef<boolean>(false);
  // 충돌 감지 참조
  const hitRightRef = useRef<boolean>(false);
  const hitLeftRef = useRef<boolean>(false);
  // 컨테이너 크기 참조
  const containerWidthRef = useRef<number>(width);
  const containerHeightRef = useRef<number>(height);
  // 로딩 상태 추가
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * 스프라이트 시트 이미지 사전 로딩 효과
   * 컴포넌트 마운트 시 스프라이트 시트 이미지를 미리 로드
   */
  useEffect(() => {
    const loadImage = async () => {
      try {
        await preloadImage(spriteSheet);
        setIsLoaded(true);
      } catch (error) {
        console.error("이미지 로딩 실패:", spriteSheet, error);
      }
    };

    loadImage();
  }, [spriteSheet]);

  /**
   * PixiJS 앱 초기화 효과
   * 이미지가 로드되면 PixiJS 애플리케이션 및 스프라이트 애니메이션 초기화
   */
  useEffect(() => {
    // 이미지가 로드되지 않았거나 이미 초기화되었거나 컨테이너가 없으면 리턴
    if (!isLoaded || initializedRef.current || !containerRef.current) return;

    // 초기화 상태 업데이트
    initializedRef.current = true;

    // 컨테이너 크기 가져오기
    containerWidthRef.current = containerRef.current.clientWidth || width;
    containerHeightRef.current = containerRef.current.clientHeight || height;

    console.log("컨테이너 크기:", containerWidthRef.current, containerHeightRef.current);

    // 캔버스 생성
    const canvas = document.createElement("canvas");
    canvas.width = containerWidthRef.current - 4; // 너비를 4px 줄임
    canvas.height = containerHeightRef.current;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "calc(100% - 4px)"; // CSS 너비도 4px 줄임
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none"; // 마우스 이벤트 무시
    canvas.style.zIndex = "100"; // z-index 값을 높여서 다른 요소 위에 표시
    canvas.style.backgroundColor = "transparent"; // 배경 투명

    // 컨테이너에 캔버스 추가
    containerRef.current.appendChild(canvas);

    // PixiJS 앱 생성 - WebGL 렌더러 설정 최적화
    const app = new PIXI.Application({
      width: containerWidthRef.current - 4, // 너비를 4px 줄임
      height: containerHeightRef.current,
      backgroundAlpha: 0,
      view: canvas,
      forceCanvas: false,
      antialias: false, // 안티앨리어싱 비활성화 (픽셀 아트에 적합)
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      clearBeforeRender: true,
      powerPreference: "high-performance", // 고성능 GPU 사용 요청
    });

    // 렌더러에 투명도 설정 추가
    if (app.renderer) {
      // 타입 안전하게 처리하기 위해 unknown으로 캐스팅 후 접근
      const renderer = app.renderer as unknown;
      // 속성 접근 및 설정
      if (renderer) {
        // 객체로 타입 단언 후 속성 설정
        const rendererObj = renderer as Record<string, unknown>;
        // 타입 안전하게 속성 설정
        if (typeof rendererObj.backgroundColor !== "undefined") {
          (rendererObj as Record<string, number>).backgroundColor = 0x000000;
        }
        if (typeof rendererObj.backgroundAlpha !== "undefined") {
          (rendererObj as Record<string, number>).backgroundAlpha = 0;
        }
      }
    }

    appRef.current = app;

    // 캔버스 컨텍스트에 투명도 설정 (필요한 경우)
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.globalAlpha = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // 스프라이트 시트 로드 - 캐시된 이미지 사용
    console.log("스프라이트 시트 로드 시도:", spriteSheet);

    // 캐시된 이미지를 사용하여 베이스 텍스처 생성
    const baseTexture = PIXI.BaseTexture.from(spriteSheet);

    // 텍스처 캐싱 활성화
    baseTexture.cacheId = spriteSheet;
    PIXI.utils.TextureCache[spriteSheet] = new PIXI.Texture(baseTexture);

    // 기본 텍스처 설정
    baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; // 픽셀 아트에 적합한 설정

    const textures: PIXI.Texture[] = [];

    // 열 수 계산 (가로 배열일 때)
    const calculatedColumns = columns > 0 ? columns : Math.ceil(frameCount / rows);

    // 스프라이트 시트에서 각 프레임의 텍스처 추출
    for (let i = 0; i < frameCount; i++) {
      let x, y;

      if (horizontal) {
        // 가로 배열 (행 우선)
        x = (i % calculatedColumns) * frameWidth;
        y = Math.floor(i / calculatedColumns) * frameHeight;
      } else {
        // 세로 배열 (열 우선)
        x = Math.floor(i / rows) * frameWidth;
        y = (i % rows) * frameHeight;
      }

      // 프레임 경계에 약간의 여백 추가 (1px)
      const padding = 1;
      const rect = new PIXI.Rectangle(x + padding, y + padding, frameWidth - padding * 2, frameHeight - padding * 2);

      const texture = new PIXI.Texture(baseTexture, rect);

      // 텍스처 스케일링 모드 설정 (픽셀 아트에 적합한 설정)
      texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

      textures.push(texture);

      console.log(`프레임 ${i + 1} 텍스처 생성:`, x + padding, y + padding, frameWidth - padding * 2, frameHeight - padding * 2);
    }

    console.log("텍스처 생성 완료:", textures.length);

    // 애니메이션 스프라이트 생성
    const animation = new PIXI.AnimatedSprite(textures);

    // 애니메이션 설정
    animation.animationSpeed = animationSpeed; // 애니메이션 속도
    animation.loop = loop; // 반복 여부

    // 픽셀 아트에 적합한 설정 (더 선명한 이미지)
    animation.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

    // 애니메이션 위치 설정
    if (moving) {
      // 이동 애니메이션인 경우
      if (direction) {
        // 왼쪽에서 오른쪽으로
        animation.x = containerWidthRef.current / 4; // 시작 위치를 화면 안쪽으로 조정
        animation.y = containerHeightRef.current / 2; // 중앙 높이
      } else {
        // 오른쪽에서 왼쪽으로
        animation.x = (containerWidthRef.current * 3) / 4; // 시작 위치를 화면 안쪽으로 조정
        animation.y = containerHeightRef.current / 2; // 중앙 높이
        animation.scale.x = -1; // 수평 반전
      }
    } else {
      // 제자리 애니메이션인 경우
      animation.x = containerWidthRef.current / 2; // 중앙 위치
      animation.y = containerHeightRef.current / 2; // 중앙 높이
      if (!direction) {
        animation.scale.x = -1; // 방향에 따라 수평 반전
      }
    }

    // 앵커 포인트 설정 (중앙)
    animation.anchor.set(0.5);

    // 크기 설정 (더 크게 조정)
    animation.width = frameWidth * 3;
    animation.height = frameHeight * 3;

    /**
     * 애니메이션 완료 이벤트 핸들러
     * 애니메이션이 끝나면 정리 작업 수행 및 콜백 호출
     */
    animation.onComplete = () => {
      console.log("애니메이션 완료");

      // 애니메이션 완료 콜백 호출
      if (onAnimationComplete) {
        onAnimationComplete();
      }

      // 반복 설정이 아니면 애니메이션 중지
      if (!loop) {
        animation.stop();
      }
    };

    // 스테이지에 애니메이션 추가
    app.stage.addChild(animation);

    // 애니메이션 참조 저장
    animationRef.current = animation;

    /**
     * 애니메이션 업데이트 함수
     * 애니메이션 프레임마다 위치 업데이트 및 충돌 감지
     */
    const updateAnimation = () => {
      if (!animation || !app) return;

      // 이동 애니메이션이고 재생 중인 경우에만 위치 업데이트
      if (moving && isPlayingRef.current && animation.playing) {
        // 방향에 따라 이동 방향 결정
        if (direction) {
          // 왼쪽에서 오른쪽으로 이동
          animation.x += 2; // 이동 속도 조정

          // 오른쪽 경계 도달 시 충돌 감지
          if (animation.x > (containerWidthRef.current * 3) / 4 && !hitRightRef.current) {
            hitRightRef.current = true;
            console.log("오른쪽 충돌 감지");
            if (onHitRight) {
              onHitRight();
            }
          }

          // 화면 밖으로 나가면 반대편에서 다시 등장
          if (animation.x > containerWidthRef.current + animation.width / 2) {
            animation.x = -animation.width / 2;
            hitRightRef.current = false;
          }
        } else {
          // 오른쪽에서 왼쪽으로 이동
          animation.x -= 2; // 이동 속도 조정

          // 왼쪽 경계 도달 시 충돌 감지
          if (animation.x < containerWidthRef.current / 4 && !hitLeftRef.current) {
            hitLeftRef.current = true;
            console.log("왼쪽 충돌 감지");
            if (onHitLeft) {
              onHitLeft();
            }
          }

          // 화면 밖으로 나가면 반대편에서 다시 등장
          if (animation.x < -animation.width / 2) {
            animation.x = containerWidthRef.current + animation.width / 2;
            hitLeftRef.current = false;
          }
        }
      }
    };

    // 애니메이션 업데이트 함수를 ticker에 추가
    app.ticker.add(updateAnimation);

    // 애니메이션 자동 시작 (isPlaying이 true인 경우)
    if (isPlaying) {
      isPlayingRef.current = true;
      animation.play();
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      // ticker에서 업데이트 함수 제거
      app.ticker.remove(updateAnimation);

      // 애니메이션 중지 및 제거
      if (animation) {
        animation.stop();
        animation.destroy();
      }

      // 앱 정리
      app.destroy(true, { children: true, texture: true, baseTexture: true });

      // 캔버스 제거
      if (containerRef.current && canvas && containerRef.current.contains(canvas)) {
        try {
          containerRef.current.removeChild(canvas);
        } catch (error) {
          console.error("정리 중 캔버스 제거 오류:", error);
        }
      }

      // 초기화 상태 리셋
      initializedRef.current = false;
    };
  }, [isLoaded, spriteSheet, frameWidth, frameHeight, frameCount, animationSpeed, direction, width, height, horizontal, rows, columns, loop, moving, onAnimationComplete, onHitLeft, onHitRight]);

  /**
   * 애니메이션 재생 상태 변경 효과
   * isPlaying prop이 변경될 때 애니메이션 재생/정지 제어
   */
  useEffect(() => {
    // 재생 상태 참조 업데이트
    isPlayingRef.current = isPlaying;

    // 애니메이션이 초기화되지 않았으면 리턴
    if (!animationRef.current) return;

    if (isPlaying) {
      // 애니메이션 시작
      console.log("애니메이션 시작");
      // 충돌 감지 상태 초기화
      hitLeftRef.current = false;
      hitRightRef.current = false;
      // 애니메이션 재생
      animationRef.current.visible = true;
      animationRef.current.play();
    } else {
      // 애니메이션 정지
      console.log("애니메이션 정지");
      animationRef.current.stop();
    }
  }, [isPlaying]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{
        overflow: "hidden",
        backgroundColor: "transparent",
      }}
    />
  );
};

export default SpriteAnimation;
