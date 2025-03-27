package com.finbattle.domain.quiz.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@DiscriminatorValue("MULTIPLE_CHOICE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "multiple_choice_quiz")
public class MultipleChoiceQuiz extends Quiz {

    @Column(name = "multiple_question", nullable = false)
    private String multipleQuestion;

    @Column(name = "multiple_first_hint", nullable = false)
    private String multipleFirstHint;

    @Column(name = "multiple_second_hint", nullable = false)
    private String multipleSecondHint;

    // ↓ quizId(FK)를 갖는 quizOptions를 매핑
    @OneToMany
    @JoinColumn(name = "quiz_id", referencedColumnName = "quiz_id", insertable = false, updatable = false)
    private List<QuizOption> quizOptions;
}