package com.goldenmonkey.adoption.repository;

import com.goldenmonkey.adoption.entity.Monkey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MonkeyRepository extends JpaRepository<Monkey, Long> {
    List<Monkey> findByIsAdoptedFalse();
    List<Monkey> findAllByOrderByIdAsc();
}
