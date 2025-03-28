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
@DiscriminatorValue("ESSAY")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "essay_quiz")
public class EssayQuiz extends Quiz {

    @Column(name = "essay_question", nullable = false)
    private String essayQuestion;

    @Column(name = "essay_first_hint", nullable = false)
    private String essayFirstHint;

    @Column(name = "essay_second_hint", nullable = false)
    private String essaySecondHint;

}
