import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, ChevronDown, Mail, MessageSquare, CheckSquare, Square as SquareIcon } from 'lucide-react';
import { OrgNode, TeacherUser } from '../types/messenger';
import { ORG_TREE } from '../data/mockData';

interface OrgTreeProps {
  teachers: TeacherUser[];
  selectedTeacherIds: string[];
  onToggleTeacher: (teacherId: string) => void;
  onSelectMultiple: (teacherIds: string[]) => void;
  onClearSelection: () => void;
  onComposeNote: (targetIds: string[]) => void;
  onStartGroupChat: (targetIds: string[]) => void;
  onStartDirectChat: (teacherId: string) => void;
  currentUserId: string;
}

export const OrgTree: React.FC<OrgTreeProps> = ({
  teachers,
  selectedTeacherIds,
  onToggleTeacher,
  onSelectMultiple,
  onClearSelection,
  onComposeNote,
  onStartGroupChat,
  onStartDirectChat,
  currentUserId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodeIds, setExpandedNodeIds] = useState<Record<string, boolean>>({
    'org-root': true,
    'school-gw': true,
    'dept-office': true,
    'dept-grade-1': true,
    'dept-grade-2': true,
    'dept-grade-3': true,
    'dept-grade-4': true,
    'dept-grade-5': true,
    'dept-grade-6': true,
    'dept-etc': true,
    'dept-help': true,
  });

  const toggleExpand = (nodeId: string) => {
    setExpandedNodeIds((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // Helper to collect all teacher IDs recursively under an OrgNode
  const getAllTeacherIdsUnder = (node: OrgNode): string[] => {
    if (node.teacherId) return [node.teacherId];
    if (!node.children) return [];
    return node.children.flatMap(getAllTeacherIdsUnder);
  };

  // Check if a node is fully or partially checked
  const getNodeCheckState = (node: OrgNode): 'checked' | 'indeterminate' | 'unchecked' => {
    const leafIds = getAllTeacherIdsUnder(node);
    if (leafIds.length === 0) return 'unchecked';
    const checkedCount = leafIds.filter((id) => selectedTeacherIds.includes(id)).length;
    if (checkedCount === leafIds.length) return 'checked';
    if (checkedCount > 0) return 'indeterminate';
    return 'unchecked';
  };

  const handleNodeCheckboxChange = (node: OrgNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const leafIds = getAllTeacherIdsUnder(node);
    const currentState = getNodeCheckState(node);

    if (currentState === 'checked') {
      // Uncheck all under this node
      const next = selectedTeacherIds.filter((id) => !leafIds.includes(id));
      onSelectMultiple(next);
    } else {
      // Check all under this node
      const combined = Array.from(new Set([...selectedTeacherIds, ...leafIds]));
      onSelectMultiple(combined);
    }
  };

  // Filtered teachers list for search
  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q)
    );
  }, [searchQuery, teachers]);

  const renderNode = (node: OrgNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expandedNodeIds[node.id];
    const checkState = getNodeCheckState(node);
    const isLeaf = !hasChildren && node.teacherId;
    const teacher = isLeaf ? teachers.find((t) => t.id === node.teacherId) : null;
    const isSelf = teacher?.id === currentUserId;

    // Indentation matching tree level
    const paddingLeft = `${level * 16 + 12}px`;

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => {
            if (hasChildren) {
              toggleExpand(node.id);
            } else if (teacher) {
              onToggleTeacher(teacher.id);
            }
          }}
          style={{ paddingLeft }}
          className={`flex items-center gap-2 py-1.5 pr-3 hover:bg-teal-50/80 cursor-pointer rounded transition-colors group text-slate-800 ${
            isLeaf && selectedTeacherIds.includes(node.teacherId!)
              ? 'bg-teal-50 font-medium'
              : ''
          }`}
        >
          {/* Expand/Collapse arrow for branches */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              className="text-slate-500 hover:text-slate-800 p-0.5"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-600" />
              )}
            </button>
          ) : (
            <span className="w-4 text-center text-slate-400 text-xs font-mono">-</span>
          )}

          {/* Square Checkbox matching screenshot */}
          <div
            onClick={(e) => handleNodeCheckboxChange(node, e)}
            className="flex items-center justify-center p-0.5 hover:scale-110 transition-transform"
          >
            <input
              type="checkbox"
              readOnly
              checked={checkState === 'checked'}
              ref={(input) => {
                if (input) input.indeterminate = checkState === 'indeterminate';
              }}
              className="square-checkbox cursor-pointer"
            />
          </div>

          {/* Label */}
          <div className="flex-1 flex items-center justify-between text-[13px] leading-tight">
            <span
              className={`${
                level === 0 || level === 1
                  ? 'font-bold text-slate-900 text-[14px]'
                  : level === 2
                  ? 'font-semibold text-slate-800'
                  : 'text-slate-700'
              }`}
            >
              {node.name}
              {isSelf && (
                <span className="ml-1.5 text-[11px] text-[#008b8b] font-bold">
                  (나)
                </span>
              )}
            </span>

            {/* Quick 1:1 chat button for teacher node */}
            {isLeaf && teacher && !isSelf && (
              <div className="hidden group-hover:flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartDirectChat(teacher.id);
                  }}
                  className="p-1 text-slate-500 hover:text-[#008b8b] hover:bg-teal-100 rounded"
                  title="1:1 대화 시작"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Children render */}
        {hasChildren && isExpanded && (
          <div className="border-l border-teal-200/60 ml-4">
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Search Bar matching screenshot */}
      <div className="p-3 border-b border-teal-200 bg-white">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="대상자를 검색하세요."
            className="w-full pl-3 pr-10 py-2 border-2 border-[#009698] rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#009698] text-slate-800 placeholder-slate-400"
          />
          <Search className="w-5 h-5 text-[#009698] absolute right-3 pointer-events-none" />
        </div>
      </div>

      {/* Multi-recipient Action Banner (Active when 1 or more checked) */}
      {selectedTeacherIds.length > 0 && (
        <div className="bg-teal-50 border-b border-teal-300 px-3 py-2 flex items-center justify-between shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008b8b]" />
            <span className="text-xs font-semibold text-slate-800">
              선택된 대상: <span className="text-[#008b8b] font-bold">{selectedTeacherIds.length}명</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onComposeNote(selectedTeacherIds)}
              className="px-2.5 py-1 text-xs font-medium text-white bg-[#008b8b] hover:bg-[#007373] rounded flex items-center gap-1 shadow-xs transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>쪽지 쓰기</span>
            </button>
            <button
              type="button"
              onClick={() => onStartGroupChat(selectedTeacherIds)}
              className="px-2.5 py-1 text-xs font-medium text-[#008b8b] border border-[#008b8b] bg-white hover:bg-teal-50 rounded flex items-center gap-1 shadow-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>그룹 대화</span>
            </button>
            <button
              type="button"
              onClick={onClearSelection}
              className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800 underline"
            >
              선택 해제
            </button>
          </div>
        </div>
      )}

      {/* Tree Content Area with Custom Teal Scrollbar */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {filteredTeachers ? (
          // Search Results View
          <div className="flex flex-col gap-1">
            <div className="text-xs font-semibold text-slate-500 mb-2">
              검색 결과: {filteredTeachers.length}명
            </div>
            {filteredTeachers.map((teacher) => {
              const isChecked = selectedTeacherIds.includes(teacher.id);
              return (
                <div
                  key={teacher.id}
                  onClick={() => onToggleTeacher(teacher.id)}
                  className={`flex items-center gap-2.5 p-2 rounded cursor-pointer border ${
                    isChecked
                      ? 'border-[#008b8b] bg-teal-50'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleTeacher(teacher.id)}
                    className="square-checkbox"
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        {teacher.name}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          ({teacher.role})
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">{teacher.department}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartDirectChat(teacher.id);
                        }}
                        className="px-2 py-1 text-xs text-[#008b8b] hover:bg-teal-100 rounded"
                      >
                        대화
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onComposeNote([teacher.id]);
                        }}
                        className="px-2 py-1 text-xs text-[#008b8b] hover:bg-teal-100 rounded"
                      >
                        쪽지
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Full Organization Tree View
          <div className="py-1">{renderNode(ORG_TREE)}</div>
        )}
      </div>
    </div>
  );
};
