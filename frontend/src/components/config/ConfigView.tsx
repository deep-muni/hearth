"use client";

import React, { useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  SimpleGrid,
} from '@chakra-ui/react';
import { HouseHelp, SalaryType } from '@/types';
import { formatCurrency } from '@/utils/dateUtils';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';

interface ConfigViewProps {
  helpers: HouseHelp[];
  onSaveHelper: (helper: HouseHelp) => void;
  onDeleteHelper: (id: string) => void;
  onResetDemo: () => void;
  onExportBackup: () => void;
  onImportBackup: (json: string) => boolean;
}

const EMOJI_OPTIONS = ['👩‍🍳', '🧹', '🚗', '👶', '🌿', '🧺', '🛡️', '🌸', '🧑‍🍳', '🐕'];

const PRESET_ROLES = [
  { role: 'Cook', emoji: '👩‍🍳' },
  { role: 'Housekeeper', emoji: '🧹' },
  { role: 'Driver', emoji: '🚗' },
  { role: 'Nanny', emoji: '👶' },
];

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const ConfigView: React.FC<ConfigViewProps> = ({
  helpers,
  onSaveHelper,
  onDeleteHelper,
  onResetDemo,
  onExportBackup,
  onImportBackup,
}) => {
  const [editingHelper, setEditingHelper] = useState<HouseHelp | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formEmoji, setFormEmoji] = useState('👩‍🍳');
  const [formSalaryType, setFormSalaryType] = useState<SalaryType>('FIXED_MONTHLY');
  const [formBaseSalary, setFormBaseSalary] = useState<number>(7000);
  const [formPaidLeaves, setFormPaidLeaves] = useState<number>(2);
  const [formWeeklyOff, setFormWeeklyOff] = useState<number>(0);
  const [formPhone, setFormPhone] = useState('');

  const openAddModal = () => {
    setEditingHelper(null);
    setFormName('');
    setFormRole('Cook');
    setFormEmoji('👩‍🍳');
    setFormSalaryType('FIXED_MONTHLY');
    setFormBaseSalary(7000);
    setFormPaidLeaves(2);
    setFormWeeklyOff(0);
    setFormPhone('');
    setIsModalOpen(true);
  };

  const openEditModal = (h: HouseHelp) => {
    setEditingHelper(h);
    setFormName(h.name);
    setFormRole(h.role);
    setFormEmoji(h.avatarEmoji);
    setFormSalaryType(h.salaryType);
    setFormBaseSalary(h.baseSalary);
    setFormPaidLeaves(h.paidLeavesAllowance);
    setFormWeeklyOff(h.weeklyOffDay);
    setFormPhone(h.phone || '');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim()) {
      alert('Please enter a name');
      return;
    }

    const helperToSave: HouseHelp = {
      id: editingHelper ? editingHelper.id : `helper_${Date.now()}`,
      name: formName.trim(),
      role: formRole.trim() || 'House Staff',
      avatarEmoji: formEmoji,
      colorTheme: 'pink',
      salaryType: formSalaryType,
      baseSalary: Math.max(0, Number(formBaseSalary) || 0),
      paidLeavesAllowance: Math.max(0, Number(formPaidLeaves) || 0),
      weeklyOffDay: Number(formWeeklyOff),
      phone: formPhone.trim(),
      isActive: true,
      joinDate: editingHelper?.joinDate || new Date().toISOString().split('T')[0],
    };

    onSaveHelper(helperToSave);
    setIsModalOpen(false);
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const success = onImportBackup(importJsonText);
    if (success) {
      alert('Imported successfully!');
      setIsImportModalOpen(false);
      setImportJsonText('');
    } else {
      alert('Invalid backup JSON');
    }
  };

  return (
    <VStack gap={4} align="stretch" maxW="580px" mx="auto" w="100%">
      {/* 1. Header with Add Button */}
      <Flex justify="space-between" align="center">
        <Box>
          <Text fontSize="md" fontWeight="800" color="#1e293b">
            House Staff ({helpers.length})
          </Text>
          <Text fontSize="11px" color="#64748b">
            Manage staff members and salary settings
          </Text>
        </Box>

        <button
          onClick={openAddModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '9999px',
            border: 'none',
            background: '#e11d48',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>Add Staff</span>
        </button>
      </Flex>

      {/* 2. Staff Cards */}
      <VStack gap={2.5} align="stretch">
        {helpers.map((h) => (
          <Box
            key={h.id}
            bg="#ffffff"
            borderRadius="2xl"
            p={3.5}
            border="1px solid #f1f5f9"
            boxShadow="0 1px 3px rgba(0,0,0,0.03)"
          >
            <Flex justify="space-between" align="center">
              <HStack gap={3}>
                <Box
                  w="40px"
                  h="40px"
                  borderRadius="xl"
                  bg="#fff1f2"
                  border="1px solid #fecdd3"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="20px"
                >
                  {h.avatarEmoji}
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="800" color="#1e293b">
                    {h.name}
                  </Text>
                  <Text fontSize="11px" color="#64748b">
                    {h.role} • {formatCurrency(h.baseSalary)}
                    {h.salaryType === 'DAILY_WAGE' ? '/day' : '/mo'}
                  </Text>
                  <Text fontSize="10px" color="#94a3b8">
                    {h.paidLeavesAllowance} paid leaves • Off: {h.weeklyOffDay >= 0 ? WEEKDAY_NAMES[h.weeklyOffDay] : 'None'}
                  </Text>
                </Box>
              </HStack>

              <HStack gap={1}>
                <button
                  onClick={() => openEditModal(h)}
                  title="Edit"
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    color: '#475569',
                  }}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove ${h.name}?`)) {
                      onDeleteHelper(h.id);
                    }
                  }}
                  title="Delete"
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    border: '1px solid #fecdd3',
                    background: '#fff1f2',
                    cursor: 'pointer',
                    color: '#e11d48',
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </HStack>
            </Flex>
          </Box>
        ))}
      </VStack>

      {/* 3. Subtle Data Backup Footer */}
      <Flex justify="center" gap={3} pt={2} pb={6} fontSize="11px" color="#64748b">
        <button
          onClick={onExportBackup}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Download size={12} /> Backup
        </button>
        <span>•</span>
        <button
          onClick={() => setIsImportModalOpen(true)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Upload size={12} /> Restore
        </button>
        <span>•</span>
        <button
          onClick={onResetDemo}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#e11d48', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <RotateCcw size={12} /> Reset Demo
        </button>
      </Flex>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <Box
          position="fixed"
          inset={0}
          bg="rgba(15, 23, 42, 0.5)"
          backdropFilter="blur(3px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={100}
          p={3}
        >
          <Box
            bg="#ffffff"
            borderRadius="2xl"
            maxW="400px"
            w="100%"
            maxH="85vh"
            overflowY="auto"
            p={5}
            boxShadow="0 20px 40px rgba(0,0,0,0.15)"
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontSize="sm" fontWeight="800" color="#1e293b">
                {editingHelper ? 'Edit Staff' : 'Add Staff'}
              </Text>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={16} />
              </button>
            </Flex>

            <VStack gap={3} align="stretch">
              {/* Name */}
              <Box>
                <Text fontSize="11px" fontWeight="700" color="#475569" mb={1}>
                  Name *
                </Text>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Sunita"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </Box>

              {/* Role */}
              <Box>
                <Text fontSize="11px" fontWeight="700" color="#475569" mb={1}>
                  Role
                </Text>
                <Flex gap={1} wrap="wrap" mb={1.5}>
                  {PRESET_ROLES.map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => {
                        setFormRole(r.role);
                        setFormEmoji(r.emoji);
                      }}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        border: '1px solid',
                        borderColor: formRole === r.role ? '#e11d48' : '#e2e8f0',
                        background: formRole === r.role ? '#fff1f2' : '#ffffff',
                        color: formRole === r.role ? '#e11d48' : '#64748b',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      {r.emoji} {r.role}
                    </button>
                  ))}
                </Flex>
                <input
                  type="text"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  placeholder="Custom role"
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
              </Box>

              {/* Emoji */}
              <Box>
                <Text fontSize="11px" fontWeight="700" color="#475569" mb={1}>
                  Icon
                </Text>
                <Flex gap={1.5} wrap="wrap">
                  {EMOJI_OPTIONS.map((em) => (
                    <Box
                      key={em}
                      onClick={() => setFormEmoji(em)}
                      w="32px"
                      h="32px"
                      borderRadius="lg"
                      border="1.5px solid"
                      borderColor={formEmoji === em ? '#e11d48' : '#e2e8f0'}
                      bg={formEmoji === em ? '#fff1f2' : '#ffffff'}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="16px"
                      cursor="pointer"
                    >
                      {em}
                    </Box>
                  ))}
                </Flex>
              </Box>

              {/* Salary Model */}
              <Box>
                <Text fontSize="11px" fontWeight="700" color="#475569" mb={1}>
                  Salary Type
                </Text>
                <SimpleGrid columns={3} gap={1.5}>
                  {[
                    { type: 'FIXED_MONTHLY', label: 'Monthly' },
                    { type: 'DAILY_WAGE', label: 'Daily' },
                    { type: 'STRICT_FLAT', label: 'Flat' },
                  ].map((s) => (
                    <button
                      key={s.type}
                      type="button"
                      onClick={() => setFormSalaryType(s.type as SalaryType)}
                      style={{
                        padding: '6px',
                        borderRadius: '8px',
                        border: '1.5px solid',
                        borderColor: formSalaryType === s.type ? '#e11d48' : '#e2e8f0',
                        background: formSalaryType === s.type ? '#fff1f2' : '#ffffff',
                        color: formSalaryType === s.type ? '#e11d48' : '#475569',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </SimpleGrid>
              </Box>

              {/* Amount & Paid Leaves */}
              <SimpleGrid columns={2} gap={2}>
                <Box>
                  <Text fontSize="11px" fontWeight="700" color="#475569" mb={1}>
                    Amount (₹)
                  </Text>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formBaseSalary}
                    onChange={(e) => setFormBaseSalary(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      fontWeight: '700',
                      outline: 'none',
                    }}
                  />
                </Box>
                <Box>
                  <Text fontSize="11px" fontWeight="700" color="#475569" mb={1}>
                    Free Leaves
                  </Text>
                  <input
                    type="number"
                    min="0"
                    max="31"
                    value={formPaidLeaves}
                    onChange={(e) => setFormPaidLeaves(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                </Box>
              </SimpleGrid>

              {/* Weekly off */}
              <Box>
                <Text fontSize="11px" fontWeight="700" color="#475569" mb={1}>
                  Weekly Off
                </Text>
                <select
                  value={formWeeklyOff}
                  onChange={(e) => setFormWeeklyOff(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                >
                  <option value={-1}>None</option>
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
              </Box>
            </VStack>

            <Flex justify="flex-end" gap={2} mt={5}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '7px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#e11d48',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </Flex>
          </Box>
        </Box>
      )}

      {/* Restore Modal */}
      {isImportModalOpen && (
        <Box
          position="fixed"
          inset={0}
          bg="rgba(15, 23, 42, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={100}
          p={3}
        >
          <Box bg="#ffffff" borderRadius="2xl" maxW="380px" w="100%" p={4}>
            <Text fontSize="sm" fontWeight="800" mb={2}>
              Restore JSON Backup
            </Text>
            <textarea
              rows={5}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste backup JSON..."
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '11px',
                outline: 'none',
                marginBottom: '10px',
              }}
            />
            <Flex justify="flex-end" gap={2}>
              <button
                onClick={() => setIsImportModalOpen(false)}
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '11px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#e11d48', color: '#fff', fontSize: '11px', fontWeight: 700 }}
              >
                Import
              </button>
            </Flex>
          </Box>
        </Box>
      )}
    </VStack>
  );
};
