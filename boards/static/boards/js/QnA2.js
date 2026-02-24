/* 전체 레이아웃 */
.board-container {
    max-width: 850px;
    margin: 40px auto;
    padding: 30px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

/* 헤더 스타일 */
.detail-header { border-bottom: 2px solid #f8f9fa; padding-bottom: 20px; margin-bottom: 30px; }
.post-category { color: #f39898; font-weight: bold; font-size: 14px; margin-bottom: 10px; }
.post-title { font-size: 26px; margin-bottom: 15px; color: #333; }
.post-meta { font-size: 14px; color: #888; display: flex; gap: 10px; }

/* 본문 스타일 */
.detail-content { min-height: 250px; margin-bottom: 40px; }
.content-body { line-height: 1.8; font-size: 16px; color: #444; white-space: pre-wrap; }
.post-images img { max-width: 100%; border-radius: 8px; margin-top: 20px; display: block; }

/* 하단 버튼 */
.detail-footer { border-top: 1px solid #eee; padding-top: 20px; margin-bottom: 50px; }
.action-buttons { display: flex; gap: 10px; }
.btn-list { margin-right: auto; background: #eee; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
.btn-edit { background: #f39898; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
.btn-delete { background: white; color: #ff6b6b; border: 1px solid #ff6b6b; padding: 10px 20px; border-radius: 5px; cursor: pointer; }

/* 댓글 섹션 디자인 */
.comment-section { background: #fcfcfc; padding: 20px; border-radius: 10px; }
.comment-title { font-size: 18px; margin-bottom: 20px; color: #333; }
.comment-item { padding: 15px 0; border-bottom: 1px solid #eee; }
.comment-author { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
.comment-text { font-size: 15px; color: #444; line-height: 1.5; }
.comment-date { font-size: 12px; color: #bbb; margin-top: 5px; }
#no-comment-msg { color: #aaa; text-align: center; padding: 20px 0; }

/* 댓글 입력란 */
.comment-input-wrapper { display: flex; gap: 10px; margin-top: 20px; }
#comment-input { flex: 1; height: 80px; padding: 12px; border: 1px solid #ddd; border-radius: 8px; resize: none; }
#btn-comment-submit { background: #f39898; color: white; border: none; padding: 0 25px; border-radius: 8px; cursor: pointer; font-weight: bold; }