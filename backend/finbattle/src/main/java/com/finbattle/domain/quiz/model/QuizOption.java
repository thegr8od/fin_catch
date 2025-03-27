package com.finbattle.domain.quiz.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "quiz_option")
public class QuizOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quiz_option_id")
    private Long quizOptionId;

    @Column(name = "quiz_id")
    private Long quizId;
    @Column(name = "option_text")// MultipleChoiceQuiz의 quizId와 매핑 (FK)
    private String optionText;
    @Column(name = "is_correct")
    private boolean isCorrect;
}