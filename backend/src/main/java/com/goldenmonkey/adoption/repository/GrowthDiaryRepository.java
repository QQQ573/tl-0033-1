package com.goldenmonkey.adoption.repository;

import com.goldenmonkey.adoption.entity.GrowthDiary;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrowthDiaryRepository extends JpaRepository<GrowthDiary, Long> {

    List<GrowthDiary> findByMonkeyIdOrderByRecordDateDesc(Long monkeyId);

    @Query("SELECT g FROM GrowthDiary g ORDER BY g.recordDate DESC, g.createdAt DESC")
    List<GrowthDiary> findLatest(Pageable pageable);

    @Query("SELECT COUNT(g) > 0 FROM GrowthDiary g WHERE g.monkeyId = :monkeyId")
    boolean existsByMonkeyId(@Param("monkeyId") Long monkeyId);
}
