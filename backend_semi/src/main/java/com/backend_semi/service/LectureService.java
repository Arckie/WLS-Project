package com.backend_semi.service;

import com.backend_semi.entity.Lecture;
import com.backend_semi.repository.LectureRepository;
import com.backend_semi.repository.LectureProgressRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class LectureService {

    @Autowired
    private LectureRepository lectureRepository;

    @Autowired
    private LectureProgressRepository lectureProgressRepository;

    // 프론트 사이드 바에 사용될 오름차순(과거순) 정렬된 과목들 가져오는 메소드
    // 프론트 강의실 화면에 사용될 데이터들을 가져오는 메소드
    public List<Lecture> getLectureList (){
        return this.lectureRepository.findLectureByOrderByIdAsc();
    }

    // 강의 등록에 관한 메소드
    public Lecture insertLecture(Lecture lecture){
        // 백엔드에서 등록일자 추가
        lecture.setCreated_at(LocalDate.now());
        System.out.println("서비스) 강의 등록 정보");
        System.out.println(lecture);

        return lectureRepository.save(lecture);
    }

    // 강의 삭제에 관한 메소드
    @Transactional
    public boolean deleteLecture(Long id){
        Lecture lecture = lectureRepository.findById(id).orElse(null);

        if(lecture == null){
            return false;
        }

        lectureProgressRepository.deleteByLecture(lecture);
        lectureRepository.delete(lecture);
        return true;
    }

    // 강의 수정에 관한 메소드
    // 강의 수정하기 get 방식 시작 (id를 이용해서 특정 강의 정보 가져오기)(강의 수정 페이지에 보여주기 용)
    public Lecture getLectureById(Long id) {
        // Optional : 해당 상품이 있을 수도 있지만, 경우에 따라서 없을 수도 있습니다.
        // findById()는 무조건 결과를 Optional 타입으로 돌려줌
        // id에 해당하는 데이터를 가져와서 lecture에 넣어주는데 오류를 방지하기 위해 Optional 타입으로 줌
        Optional<Lecture> lecture = this.lectureRepository.findById(id);

        // 의미 있는 데이터이면 그냥 넘기고, 그렇지 않으면 null을 반환해 줍니다.
        return lecture.orElse(null);
    }

    // 상품 수정하기 put 방식 시작
    public Optional<Lecture> findById(Long id) {
        return lectureRepository.findById(id);
    }

    // 상품 수정하기 - 전에 있던 강의 내용을 가져와서 수정한 강의 내용으로 데이터의 값을 바꿔서 다시 저장하기
    public Lecture updateLecture(Lecture savedLecture, Lecture updatedLecture) {
        savedLecture.setCategory(updatedLecture.getCategory());
        savedLecture.setName(updatedLecture.getName());
        savedLecture.setLecture_description(updatedLecture.getLecture_description());
        savedLecture.setCode_example(updatedLecture.getCode_example());
        savedLecture.setCode_description(updatedLecture.getCode_description());
        savedLecture.setLanguage(updatedLecture.getLanguage());
        // 등록일자는 놔두고 수정일자만 추가하기
        savedLecture.setUpdated_at(LocalDate.now());

        // 새로운 정보를 사진 상품을 데이터 베이스에 다시 저장함
        return lectureRepository.save(savedLecture);
    }


}
