import React, { useEffect, useState } from "react";
import { X, PlusCircle, Trash, Loader2, ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { quizService } from "../services/quiz.service";
import type { CreateQuizPayload, QuizQuestionPayload } from "../models/quiz";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  lectureId: string | null;
  quizIdToEdit: string | null;
  onSuccess: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, lectureId, quizIdToEdit, onSuccess }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [testTime, setTestTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestionPayload[]>([
    {
      content: "",
      explanation: "",
      displayOrder: 1,
      imageUrl: "",
      imagePublicId: "",
      image: "",
      options: [
        { content: "", isCorrect: true, displayOrder: 1 },
        { content: "", isCorrect: false, displayOrder: 2 }
      ]
    }
  ]);

  // Reset or Load Data when Modal Opens
  useEffect(() => {
    if (isOpen) {
      if (quizIdToEdit) {
        loadQuizDetail(quizIdToEdit);
      } else {
        resetForm();
      }
    }
  }, [isOpen, quizIdToEdit]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, isLoading, onClose]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setTestTime(0);
    setQuestions([{
      content: "", explanation: "", displayOrder: 1,
      imageUrl: "", imagePublicId: "", image: "",
      options: [{ content: "", isCorrect: true, displayOrder: 1 }, { content: "", isCorrect: false, displayOrder: 2 }]
    }]);
  };

  const loadQuizDetail = async (id: string) => {
    setIsLoading(true);
    try {
        const response: any = await quizService.getQuizById(id);
        const data = response?.data || response; 
        
        if (data) {
            setName(data.name || "");
            setDescription(data.description || "");
            setTestTime(data.testTime || 0);

            if (Array.isArray(data.questions) && data.questions.length > 0) {
                const mappedQuestions = data.questions.map((q: any, index: number) => ({
                    content: q.content || q.question || "",
                    explanation: q.explanation || q.description || "",
                    displayOrder: q.displayOrder || index + 1,
                    imageUrl: q.imageUrl || "",
                    imagePublicId: q.imagePublicId || "",
                    image: "",
                    options: Array.isArray(q.options)
                      ? q.options.map((o: any, oIdx: number) => ({
                          content: o.content || "",
                          isCorrect: o.isCorrect || false,
                          displayOrder: o.displayOrder || oIdx + 1
                        }))
                      : []
                }));
                setQuestions(mappedQuestions);
            }
        }
    } catch (e) {
        toast.error("Lỗi khi tải thông tin Quiz.");
        onClose();
    } finally {
        setIsLoading(false);
    }
  };

  // --- Handlers ---
  const handleAddQuestion = () => {
    setQuestions(prev => [
        ...prev,
        {
            content: "", explanation: "", displayOrder: prev.length + 1,
            imageUrl: "", imagePublicId: "", image: "",
            options: [{ content: "", isCorrect: true, displayOrder: 1 }, { content: "", isCorrect: false, displayOrder: 2 }]
        }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(prev =>
        prev.filter((_, i) => i !== index)
            .map((q, i) => ({ ...q, displayOrder: i + 1 }))
    );
  };

  const updateQuestionText = (index: number, val: string) => {
    setQuestions(prev =>
        prev.map((q, i) => i !== index ? q : { ...q, content: val })
    );
  };

  const updateQuestionExplanation = (index: number, val: string) => {
    setQuestions(prev =>
        prev.map((q, i) => i !== index ? q : { ...q, explanation: val })
    );
  };

  const handleAddOption = (qIndex: number) => {
    setQuestions(prev =>
        prev.map((q, i) => i !== qIndex ? q : {
            ...q,
            options: [
                ...q.options,
                { content: "", isCorrect: false, displayOrder: q.options.length + 1 }
            ]
        })
    );
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    if (questions[qIndex].options.length <= 2) {
        toast.error("Một câu hỏi cần tối thiểu 2 đáp án.");
        return;
    }
    setQuestions(prev =>
        prev.map((q, i) => i !== qIndex ? q : {
            ...q,
            options: q.options
                .filter((_, oi) => oi !== oIndex)
                .map((opt, oi) => ({ ...opt, displayOrder: oi + 1 }))
        })
    );
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    setQuestions(prev =>
        prev.map((q, i) => i !== qIndex ? q : {
            ...q,
            options: q.options.map((opt, oi) =>
                oi !== oIndex ? opt : { ...opt, content: text }
            )
        })
    );
  };

  const setCorrectOption = (qIndex: number, oIndex: number) => {
    setQuestions(prev =>
        prev.map((q, i) => i !== qIndex ? q : {
            ...q,
            options: q.options.map((opt, oi) => ({
                ...opt,
                isCorrect: oi === oIndex
            }))
        })
    );
  };

  const handleQuestionImage = (qIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setQuestions(prev =>
        prev.map((q, i) => i !== qIndex ? q : { ...q, image: base64, imageUrl: "", imagePublicId: "" })
      );
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const removeQuestionImage = (qIndex: number) => {
    setQuestions(prev =>
      prev.map((q, i) => i !== qIndex ? q : { ...q, image: "", imageUrl: "", imagePublicId: "" })
    );
  };

  const handleSubmit = async () => {
    if (!lectureId && !quizIdToEdit) return;
    if (!name.trim()) { toast.error("Vui lòng nhập tiêu đề Quiz"); return; }
    if (questions.length === 0) { toast.error("Vui lòng thêm ít nhất 1 câu hỏi."); return; }

    // Validation loop
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.content.trim()) { toast.error(`Câu hỏi ${i+1} chưa có nội dung.`); return; }
        if (q.options.length < 2) { toast.error(`Câu hỏi ${i+1} cần ít nhất 2 đáp án.`); return; }
        
        let hasContent = true;
        let hasCorrect = false;
        q.options.forEach(o => {
            if (!o.content.trim()) hasContent = false;
            if (o.isCorrect) hasCorrect = true;
        });

        if (!hasContent) { toast.error(`Vui lòng nhập đầy đủ nội dung các đáp án ở câu ${i+1}.`); return; }
        if (!hasCorrect) { toast.error(`Vui lòng chọn đáp án đúng cho câu ${i+1}.`); return; }
    }

    setIsLoading(true);
    let result;
    
    // Strict Type Mapping
    const formattedQuestions = questions.map((q, i) => {
        const questionPayload: any = {
            content: q.content.trim(),
            displayOrder: i + 1,
            explanation: q.explanation ? q.explanation.trim() : "",
            options: q.options.map((o, j) => ({
                content: o.content.trim(),
                isCorrect: o.isCorrect,
                displayOrder: j + 1
            }))
        };
        // Only include image fields when they have actual values
        if (q.imageUrl) questionPayload.imageUrl = q.imageUrl;
        if (q.imagePublicId) questionPayload.imagePublicId = q.imagePublicId;
        if (q.image) questionPayload.image = q.image;
        return questionPayload;
    });

    // Ensure integers
    const finalTestTime = Math.max(0, Math.floor(testTime || 0));

    try {
        if (quizIdToEdit) {
            // Update
            const payload = {
                name: name.trim(),
                description: description.trim(),
                testTime: finalTestTime,
                questions: formattedQuestions
            };
            result = await quizService.updateQuiz(quizIdToEdit, payload);
        } else {
            // Create
            if (!lectureId) return;
            const payload: CreateQuizPayload = {
                name: name.trim(),
                description: description.trim() || undefined,
                lectureId,
                testTime: finalTestTime,
                questions: formattedQuestions
            };
            
            result = await quizService.createQuiz(payload);
        }

        if (result && (result.success || result.data || result.id)) {
            toast.success(quizIdToEdit ? "Cập nhật Quiz thành công!" : "Tạo Quiz thành công!");
            onSuccess();
            onClose();
        } else {
            toast.error(result?.message || "Có lỗi xảy ra khi lưu.");
        }
    } catch (e: any) {
        console.error("API Error Saving Quiz:", e);
        const responseData = e?.response?.data;
        console.error("[QuizModal] Full error response:", JSON.stringify(responseData, null, 2));
        // Extract detailed validation errors from ASP.NET ModelState or custom errors
        let errorMessage = "Lỗi API khi lưu Quiz.";
        if (responseData) {
            if (typeof responseData === "string") {
                errorMessage = responseData;
            } else if (responseData.message) {
                errorMessage = responseData.message;
            } else if (responseData.errors) {
                // ASP.NET ModelState errors: { errors: { FieldName: ["msg"] } }
                const errs = Object.values(responseData.errors).flat() as string[];
                errorMessage = errs.join(" | ");
            } else if (responseData.title) {
                errorMessage = responseData.title;
            }
        } else {
            errorMessage = e?.message || errorMessage;
        }
        toast.error(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
       <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="border-b px-6 py-4 flex justify-between items-center bg-white rounded-t-xl z-10">
             <div>
                <h3 className="text-xl font-bold text-gray-900">{quizIdToEdit ? "Chỉnh Sửa Quiz" : "Tạo Quiz Mới"}</h3>
                <p className="text-sm text-gray-500">Tạo bài kiểm tra trắc nghiệm cho học viên</p>
             </div>
             <button onClick={onClose} disabled={isLoading}><X className="text-gray-400 hover:text-gray-700 transition"/></button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
             {isLoading && quizIdToEdit && !name ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#5a2dff]"/></div>
             ) : (
             <>
                 <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <label className="mb-1 block text-sm font-bold text-gray-700">Tiêu đề Quiz <span className="text-red-500">*</span></label>
                    <input 
                       value={name} onChange={e => setName(e.target.value)} 
                       className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff] mb-4" 
                       placeholder="Ví dụ: Kiểm tra kiến thức chương 1"
                    />
                    
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Mô tả (tùy chọn)</label>
                    <input 
                       value={description} onChange={e => setDescription(e.target.value)}
                       className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff] mb-4" 
                       placeholder="Mô tả ngắn về nội dung quiz"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Thời gian (phút)</label>
                            <input
                               type="number" min="0" onWheel={(e) => (e.target as HTMLInputElement).blur()}
                               value={testTime} onChange={e => setTestTime(Number(e.target.value))}
                               className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff]"
                               placeholder="0 = Không giới hạn"
                            />
                        </div>
                    </div>
                 </div>

                 <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-800">Câu hỏi</h4>
                    <button onClick={handleAddQuestion} className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <PlusCircle size={16}/> Thêm câu hỏi
                    </button>
                 </div>

                 <div className="space-y-4">
                    {questions.map((q, qImg) => (
                       <div key={qImg} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative group">
                          {questions.length > 1 && (
                              <button onClick={() => handleRemoveQuestion(qImg)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1" title="Xóa câu hỏi">
                                  <Trash size={18}/>
                              </button>
                          )}
                          
                          <div className="mb-4">
                              <label className="block text-sm font-bold text-gray-800 mb-2">Câu {qImg + 1}</label>
                              <input
                                 value={q.content}
                                 onChange={e => updateQuestionText(qImg, e.target.value)}
                                 className="w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:bg-white focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff] transition-colors"
                                 placeholder="Nhập nội dung câu hỏi..."
                              />

                              {/* Image preview or upload button */}
                              {(q.image || q.imageUrl) ? (
                                <div className="mt-2">
                                  <div className="relative inline-block">
                                    <img
                                      src={q.image || q.imageUrl}
                                      alt="Ảnh câu hỏi"
                                      className="max-h-48 max-w-full rounded-lg border border-gray-200 object-contain"
                                    />
                                    {!q.image && q.imageUrl && (
                                      <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                                        Ảnh đã lưu
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => removeQuestionImage(qImg)}
                                      className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow border border-gray-200 hover:border-red-400"
                                      title="Xóa ảnh"
                                    >
                                      <X size={14} className="text-red-500" />
                                    </button>
                                  </div>
                                  <div className="mt-1.5">
                                    <input
                                      type="file"
                                      id={`img-${qImg}`}
                                      accept="image/*"
                                      className="hidden"
                                      onChange={e => handleQuestionImage(qImg, e)}
                                    />
                                    <label
                                      htmlFor={`img-${qImg}`}
                                      className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-gray-500 border border-dashed border-gray-300 rounded-lg px-2.5 py-1 hover:text-[#5a2dff] hover:border-[#5a2dff] transition-colors"
                                    >
                                      <ImageIcon size={12} /> Thay thế ảnh
                                    </label>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-2">
                                  <input
                                    type="file"
                                    id={`img-${qImg}`}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => handleQuestionImage(qImg, e)}
                                  />
                                  <label
                                    htmlFor={`img-${qImg}`}
                                    className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg px-3 py-1.5 hover:text-[#5a2dff] hover:border-[#5a2dff] transition-colors"
                                  >
                                    <ImageIcon size={14} /> Thêm ảnh
                                  </label>
                                </div>
                              )}
                          </div>

                          <div className="space-y-3 mb-4">
                              <p className="text-sm font-semibold text-gray-700">Đáp án (chọn đáp án đúng)</p>
                              {q.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="flex items-center gap-3">
                                      <input 
                                          type="radio" 
                                          name={`q-${qImg}-correct`}
                                          checked={opt.isCorrect}
                                          onChange={() => setCorrectOption(qImg, oIdx)}
                                          className="h-5 w-5 border-gray-300 text-[#5a2dff] focus:ring-[#5a2dff] cursor-pointer"
                                      />
                                      
                                      <div className={`flex-1 flex items-center rounded-lg border px-3 py-2 ${opt.isCorrect ? "border-[#5a2dff] bg-[#5a2dff]/5" : "border-gray-200"}`}>
                                          <input 
                                              value={opt.content}
                                              onChange={e => updateOptionText(qImg, oIdx, e.target.value)}
                                              className="flex-1 bg-transparent border-none p-0 text-sm focus:ring-0"
                                              placeholder={`Nhập đáp án...`}
                                          />
                                          {opt.isCorrect && <div className="text-[#5a2dff] ml-2 font-bold text-xs">ĐÚNG</div>}
                                      </div>

                                      <button 
                                        onClick={() => handleRemoveOption(qImg, oIdx)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                        title="Xóa đáp án này"
                                        disabled={q.options.length <= 2}
                                      >
                                          <X size={16} />
                                      </button>
                                  </div>
                              ))}

                              <button 
                                onClick={() => handleAddOption(qImg)}
                                className="mt-2 text-sm text-[#5a2dff] font-medium hover:underline flex items-center gap-1"
                              >
                                <PlusCircle size={14} /> Thêm đáp án
                              </button>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100">
                             <label className="block text-sm font-semibold text-gray-700 mb-2">Giải thích (tùy chọn)</label>
                             <textarea 
                                value={q.explanation || ""}
                                onChange={e => updateQuestionExplanation(qImg, e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff]"
                                placeholder="Giải thích tại sao đáp án trên là đúng..."
                                rows={2}
                             />
                          </div>
                       </div>
                    ))}
                 </div>
             </>
             )}
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 flex justify-end gap-2 bg-white rounded-b-xl z-10">
             <button onClick={onClose} disabled={isLoading} className="rounded-lg border px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50">Hủy</button>
             <button 
                onClick={handleSubmit}
                disabled={isLoading} 
                className="flex items-center gap-2 rounded-lg bg-[#5a2dff] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#5a2dff]/30 hover:bg-[#4b24cc] disabled:opacity-70"
             >
                {isLoading ? <Loader2 className="animate-spin h-4 w-4"/> : (quizIdToEdit ? "Cập nhật" : "Tạo Quiz")}
             </button>
          </div>
       </div>
    </div>
  );
};

export default QuizModal;
