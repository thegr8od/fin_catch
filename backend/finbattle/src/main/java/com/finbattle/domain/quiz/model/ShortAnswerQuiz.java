package com.finbattle.domain.quiz.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "short_answer_quiz")
@DiscriminatorValue("SHORT_ANSWER")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShortAnswerQuiz extends Quiz {

    @Column(name = "short_question", nullable = false)
    private String shortQuestion;

    @Column(name = "short_answer", nullable = false)
    private String shortAnswer;

    @Column(name = "short_first_hint")
    private String shortFirstHint;
    @Column(name = "short_second_hint")
    private String shortSecondHint;
}
