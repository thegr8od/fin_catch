package com.finbattle.domain.cat.service;

import com.finbattle.domain.cat.repository.CatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CatService {

    private final CatRepository catRepository;

}
