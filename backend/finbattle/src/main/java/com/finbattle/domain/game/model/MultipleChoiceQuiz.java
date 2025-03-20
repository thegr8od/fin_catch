package com.finbattle.domain.game.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "multiple_choice_quiz")
public class MultipleChoiceQuiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quiz_id")
    private Long quizId;

    @Column(name = "multiple_question")
    private String multipleQuestion;

    @OneToOne
    @JoinColumn(name = "quiz_id", referencedColumnName = "quiz_id", insertable = false, updatable = false)
    private Quiz quiz;

    // 보기(quiz_option)와 1:N 관계
    @OneToMany(mappedBy = "multipleChoiceQuiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<QuizOption> options = new ArrayList<>();

    /**
     * 편의 메서드: 선택지 추가 시 양방향 관계 설정
     */
    public void addOption(QuizOption option) {
        options.add(option);
        option.setMultipleChoiceQuiz(this);
    }

    public void removeOption(QuizOption option) {
        options.remove(option);
        option.setMultipleChoiceQuiz(null);
    }
}
