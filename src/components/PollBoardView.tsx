import React, { useState } from 'react';
import { Home, Vote, Plus, X, CheckCircle2, BarChart2 } from 'lucide-react';
import { Poll, TeacherUser } from '../types/messenger';

interface PollBoardViewProps {
  polls: Poll[];
  currentUser: TeacherUser;
  onCastVote: (pollId: string, optionId: string) => void;
  onCreatePoll: (pollData: {
    title: string;
    description: string;
    options: string[];
  }) => void;
}

export const PollBoardView: React.FC<PollBoardViewProps> = ({
  polls,
  currentUser,
  onCastVote,
  onCreatePoll,
}) => {
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '']);

  const activePoll = selectedPoll
    ? polls.find((p) => p.id === selectedPoll.id) || selectedPoll
    : null;

  const hasVoted = activePoll?.votedUserIds.includes(currentUser.id);

  const handleVote = () => {
    if (!activePoll || !selectedOptionId) {
      alert('투표 항목을 선택해 주세요.');
      return;
    }
    onCastVote(activePoll.id, selectedOptionId);
  };

  const handleCreatePoll = () => {
    if (!newTitle.trim()) {
      alert('투표 제목을 입력해 주세요.');
      return;
    }
    const validOptions = newOptions.filter((o) => o.trim());
    if (validOptions.length < 2) {
      alert('투표 항목을 2개 이상 입력해 주세요.');
      return;
    }

    onCreatePoll({
      title: newTitle.trim(),
      description: newDesc.trim() || '교직원 여러분의 의견을 수렴합니다.',
      options: validOptions,
    });
    setNewTitle('');
    setNewDesc('');
    setNewOptions(['', '', '']);
    setShowCreateModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white select-none overflow-hidden">
      {/* Breadcrumb Header matching Screenshot 9 */}
      <div className="px-4 py-2 bg-white border-b-2 border-[#008b8b] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-base font-bold text-[#008b8b]">
          <Home className="w-5 h-5 text-[#008b8b]" />
          <span>홈 &gt; 투표</span>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1 bg-[#008b8b] hover:bg-[#007373] text-white text-xs font-semibold rounded flex items-center gap-1 shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>새 투표 등록</span>
        </button>
      </div>

      {/* Table Content matching Screenshot 9 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="border-2 border-[#008b8b] rounded overflow-hidden shadow-xs bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[#008b8b] bg-teal-50/50 text-[#008b8b] font-bold text-sm">
                <th className="py-2.5 px-4 text-center w-auto">제목</th>
                <th className="py-2.5 px-4 text-center w-36 border-l-2 border-[#008b8b]">작성자</th>
                <th className="py-2.5 px-4 text-center w-24 border-l-2 border-[#008b8b]">조회수</th>
                <th className="py-2.5 px-4 text-center w-32 border-l-2 border-[#008b8b]">작성일</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#008b8b]/40 text-xs text-slate-800">
              {polls.map((p) => {
                const userVoted = p.votedUserIds.includes(currentUser.id);
                return (
                  <tr
                    key={p.id}
                    onClick={() => {
                      setSelectedPoll(p);
                      setSelectedOptionId('');
                    }}
                    className="hover:bg-teal-50/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        {userVoted ? (
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                            참여완료
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                            진행중
                          </span>
                        )}
                        <span className="truncate">{p.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600 border-l-2 border-[#008b8b]">
                      {p.author}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500 font-mono border-l-2 border-[#008b8b]">
                      {p.views}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500 font-mono border-l-2 border-[#008b8b]">
                      {p.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Poll Voting & Results Modal */}
      {activePoll && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-lg rounded border-2 border-[#008b8b] shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
            <div className="px-4 py-2.5 bg-white border-b-2 border-[#008b8b] flex items-center justify-between">
              <span className="font-bold text-base text-[#008b8b] flex items-center gap-2">
                <Vote className="w-5 h-5" />
                투표 참여 및 결과
              </span>
              <button
                type="button"
                onClick={() => setSelectedPoll(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
              <div className="border border-teal-200 rounded p-3 bg-teal-50/50 space-y-1">
                <div className="text-sm font-bold text-slate-900">{activePoll.title}</div>
                <div className="text-xs text-slate-600">{activePoll.description}</div>
                <div className="text-[11px] text-slate-500 pt-1">
                  작성자: {activePoll.author} | 전체 참여: {activePoll.totalVotes}명
                </div>
              </div>

              {/* Options List */}
              <div className="space-y-2">
                {activePoll.options.map((opt) => {
                  const percentage =
                    activePoll.totalVotes > 0
                      ? Math.round((opt.votes / activePoll.totalVotes) * 100)
                      : 0;
                  const isUserChoice = opt.voters.includes(currentUser.id);

                  return (
                    <div
                      key={opt.id}
                      onClick={() => !hasVoted && setSelectedOptionId(opt.id)}
                      className={`p-3 rounded border transition-all ${
                        !hasVoted
                          ? selectedOptionId === opt.id
                            ? 'border-[#008b8b] bg-teal-50/80 cursor-pointer'
                            : 'border-slate-200 hover:border-teal-300 cursor-pointer'
                          : isUserChoice
                          ? 'border-emerald-500 bg-emerald-50/50'
                          : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2 font-medium text-slate-800">
                          {!hasVoted && (
                            <input
                              type="radio"
                              name="poll-option"
                              checked={selectedOptionId === opt.id}
                              onChange={() => setSelectedOptionId(opt.id)}
                              className="accent-[#008b8b]"
                            />
                          )}
                          {isUserChoice && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                          <span>{opt.text}</span>
                        </div>
                        <span className="font-mono text-slate-600 font-semibold">
                          {opt.votes}표 ({percentage}%)
                        </span>
                      </div>

                      {/* Result Progress Bar */}
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isUserChoice ? 'bg-emerald-500' : 'bg-[#008b8b]'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-2.5 bg-slate-50 border-t flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {hasVoted ? '이미 투표에 참여하셨습니다.' : '하나의 항목을 선택 후 투표해 주세요.'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPoll(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-100"
                >
                  닫기
                </button>
                {!hasVoted && (
                  <button
                    type="button"
                    onClick={handleVote}
                    className="px-4 py-1.5 bg-[#008b8b] hover:bg-[#007373] text-white rounded text-xs font-bold transition-colors"
                  >
                    투표하기
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-md rounded border-2 border-[#008b8b] shadow-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-sm text-[#008b8b]">새 투표 등록</span>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">투표 제목</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="투표 제목을 입력하세요"
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008b8b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">설명</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="투표 취지 및 설명"
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008b8b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">투표 항목</label>
              <div className="space-y-1.5">
                {newOptions.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...newOptions];
                      updated[idx] = e.target.value;
                      setNewOptions(updated);
                    }}
                    placeholder={`항목 ${idx + 1}`}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#008b8b]"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-100"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleCreatePoll}
                className="px-4 py-1.5 bg-[#008b8b] hover:bg-[#007373] text-white rounded text-xs font-bold"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
