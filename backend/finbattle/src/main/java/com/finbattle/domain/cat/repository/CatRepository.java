package com.finbattle.domain.cat.repository;

import com.finbattle.domain.cat.entity.Cat;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CatRepository extends JpaRepository<Cat, Long> {

    Optional<Cat> findByCatId(Long catId);

    Optional<Cat> findByCatName(String catName);
}
