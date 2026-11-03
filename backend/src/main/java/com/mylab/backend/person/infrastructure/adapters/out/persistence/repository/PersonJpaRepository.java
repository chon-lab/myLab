package com.mylab.backend.person.infrastructure.adapters.out.persistence.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mylab.backend.person.infrastructure.adapters.out.persistence.entity.PersonEntity;

@Repository
public interface PersonJpaRepository extends JpaRepository<PersonEntity, UUID> {

    Optional<PersonEntity> findByEmailIgnoreCaseAndDeletedAtIsNull(String email);

    @Query("""
            SELECT p FROM PersonEntity p
            WHERE p.deletedAt IS NULL
              AND (:query = ''
                   OR LOWER(p.name) LIKE CONCAT('%', :query, '%')
                   OR LOWER(p.email) LIKE CONCAT('%', :query, '%'))
            ORDER BY p.name ASC
            """)
    List<PersonEntity> searchAssignable(@Param("query") String query, Pageable pageable);
}
