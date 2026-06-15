package com.backend_semi.controller;

import com.backend_semi.entity.Lecture;
import com.backend_semi.service.LectureService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/lecture")
public class LectureController {
    @Autowired
    private LectureService lectureService;


    // 프론트 사이드바와 강의실 내용에 대한 데이터를 보내기
    @GetMapping("/list")
    public List<Lecture> list(){
        List<Lecture> lectures = this.lectureService.getLectureList();
        return lectures;
    }

    // 강의 등록할때 사용하는 PostMapping
    @PostMapping("/insert")
    public ResponseEntity<?> insert(@Valid @RequestBody Lecture lecture, BindingResult bindingResult){
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError xx : bindingResult.getFieldErrors()) {
                errors.put(xx.getField(), xx.getDefaultMessage());
            }

            return new ResponseEntity<>(
                    Map.of(
                            "message", "상품 등록 유효성 검사에 문제가 있습니다.",
                            "errors", errors
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }

        try { // 성공하면 강의 저장함
            Lecture savedLecture = this.lectureService.insertLecture(lecture);

            if (savedLecture == null) {
                return ResponseEntity
                        .status(500)
                        .body(
                                Map.of(
                                        "message", "강의 등록에 실패하였습니다.",
                                        "error", "bad image file format"
                                )
                        );
            }

            return ResponseEntity.ok(
                    Map.of(
                            "message", "강의가 성공적으로 등록되었습니다."
                    )
            );

        } catch (Exception err) { // 데이터 베이스 오류
            return ResponseEntity
                    .status(500)
                    .body(
                            Map.of(
                                    "message", err.getMessage(),
                                    "error", "Internet Server Error"
                            )
                    );
        }
    }

    // 강의 삭제할때 사용하는 DeleteMapping
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id){
        try {
            boolean isDeleted = this.lectureService.deleteLecture(id);

            if(isDeleted){ // isDeleted가 true면 삭제가 정상적으로 되었다는 뜻
                // 여기까지 왔다는 것은 에러없이 성공해서 내가 원하는 동작인 삭제가 된 것임
                return ResponseEntity.ok(id + "번 강의가 삭제되었습니다.");
            }else{ // 삭제를 할 강의 자체가 없는 상태
                return ResponseEntity.badRequest().body(id + "번 강의가 존재하지 않습니다.");
            }

        }catch (DataIntegrityViolationException err){// 데이터 베이스 무결성 위배되는 에러가 발생할때
            String message = "해당 강의의 무결성이 위배되었습니다." ;
            return ResponseEntity.internalServerError().body(message);

        }catch (Exception err){ // 두루뭉실한 예외처리
            return ResponseEntity.internalServerError().body("오류 발생 : " + err.getMessage());
        }
    }

    // 강의 수정할때 사용하는 GetMapping
    // 프론트 앤드의 강의 수정 페이지에서 조회 요청이 들어옴
    // 강의의 id 정보를 이용하여 해당 상품 Bean 객체를 반환해서 프론트의 수정페이지에 정보를 표시함
    @GetMapping("/update/{id}")
    public ResponseEntity<Lecture> getUpdate(@PathVariable Long id){
        System.out.println("수정할 상품 번호 : " + id);

        // id에 해당하는 강의 정보 가져오기
        Lecture lecture = this.lectureService.getLectureById(id) ;

        if(lecture == null){ // 강의가 없으면 404 응답과 함께 null을 반환
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);

        }else{ // 해당 강의 정보와 함께, 성공(200) 메시지를 반환합니다.
            return ResponseEntity.ok(lecture);
        }
    }

    // 강의 수정할때 사용하는 PutMapping
    // 프론트 엔드의 상품 수정 페이지에서 수정 요청이 들어옴
    // 프론트에서 작성한 수정한 lecture 객체를 받아와서 데이터 베이스의 기존 lecture 객체에 덮어쓰기함
    @PutMapping("/update/{id}")
    public ResponseEntity<?> putUpdate(@PathVariable Long id,
                                       @Valid @RequestBody Lecture updatedLecture,
                                       BindingResult bindingResult) {
        // 1. 유효성 검사
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return new ResponseEntity<>(
                    Map.of(
                            "message", "강의 수정 유효성 검사에 문제가 있습니다.",
                            "errors", errors
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }

        // 2. 강의 조회
        Optional<Lecture> findLecture = lectureService.findById(id);

        if (findLecture.isEmpty()) {
            // ResponseEntity.notFound().build(): 지울 대상이 없으므로 깔끔하게
            // HTTP 상태 코드 404 Not Found 봉투만 빌드(build())해서 리액트에게 던짐
            return ResponseEntity.notFound().build();
        }

        try { // findLecture의 타입이 Optional이여서 굳이 get()을 하고 Lecture타입의 변수에 다시 넣음
            Lecture savedLecture = findLecture.get();
            // 새로운 Lecture의 정보를 기존에 저장된 Lecture정보에 덮어쓰기함 (service에서 만든 메소드이용)
            lectureService.updateLecture(savedLecture, updatedLecture);

            // 프론트에는 성공했다는 메시지를 보냄
            return ResponseEntity.ok(Map.of("message", "강의 수정 성공"));

        } catch (Exception err) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message", err.getMessage(),
                            "error", "강의 수정 실패"
                    ));
        }
    }

}
