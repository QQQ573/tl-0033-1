package com.goldenmonkey.adoption.service;

import com.goldenmonkey.adoption.dto.MonkeyDetailVO;
import com.goldenmonkey.adoption.entity.Monkey;
import com.goldenmonkey.adoption.repository.MonkeyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MonkeyService {

    @Autowired
    private MonkeyRepository monkeyRepository;

    public List<MonkeyDetailVO> getAllMonkeys() {
        return monkeyRepository.findAllByOrderByIdAsc().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    public List<MonkeyDetailVO> getAvailableMonkeys() {
        return monkeyRepository.findByIsAdoptedFalse().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    public Optional<MonkeyDetailVO> getMonkeyById(Long id) {
        return monkeyRepository.findById(id).map(this::convertToVO);
    }

    public Optional<Monkey> getMonkeyEntityById(Long id) {
        return monkeyRepository.findById(id);
    }

    public void markAsAdopted(Long id) {
        monkeyRepository.findById(id).ifPresent(monkey -> {
            monkey.setIsAdopted(true);
            monkeyRepository.save(monkey);
        });
    }

    private MonkeyDetailVO convertToVO(Monkey monkey) {
        MonkeyDetailVO vo = new MonkeyDetailVO();
        vo.setId(monkey.getId());
        vo.setName(monkey.getName());
        vo.setCode(monkey.getCode());
        vo.setGender(monkey.getGender());
        vo.setAge(monkey.getAge());
        vo.setHealthStatus(monkey.getHealthStatus());
        vo.setHabitat(monkey.getHabitat());
        vo.setPersonality(monkey.getPersonality());
        vo.setStory(monkey.getStory());
        vo.setImageUrl(monkey.getImageUrl());
        vo.setIsAdopted(monkey.getIsAdopted());
        vo.setCreatedAt(monkey.getCreatedAt());
        return vo;
    }
}
