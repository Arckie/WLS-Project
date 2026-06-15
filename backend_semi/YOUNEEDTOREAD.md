## 읽으시오
## 무조건 이것은 추가되어야한다.
## lecture id는 DB 최초 생성 이후 AUTO CREMENT 옵션을 DB로 삽입할 것.
## FIRST 관심 학습 사항 추가

INSERT INTO learning_profiles (learning_profile_id, profile_code)
VALUES
(1, 'FRONT'),
(2, 'BACK'),
(3, '웹 서비스'),
(4, 'UI');

## 공지사항 카테고리 추가

INSERT INTO notice_categories (notice_category_id, category_name)
VALUES
(1, '공지'),
(2, '중요'),
(3, '업데이트'),
(4, '안내');

## LECTURE id AUTO INCREMENT 옵션 추가

ALTER TABLE lectures MODIFY lecture_id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE members MODIFY member_id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE LECTURE_PROGRESS MODIFY lecture_progress_id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE favorite MODIFY favorite_id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE notices MODIFY notice_id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE notice_categories MODIFY notice_category_id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE learning_profiles MODIFY learning_profile_id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE member_learning_profiles MODIFY member_learning_profile_id BIGINT NOT NULL AUTO_INCREMENT;