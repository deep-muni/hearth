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

const EMOJI_OPTIONS = ['👩‍🍳', '🧹', '🚗', '👶', '🌿', '🧺', '🛡️', '🌸', '🐕'];

const PRESET_ROLES = [
  { role: 'Cook', emoji: '👩‍🍳' },
  { role: 'Housekeeper', emoji: '🧹' },
  { role: 'Driver', emoji: '🚗' },
  { role: 'Nanny', emoji: '👶' },
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
      role: formRole.trim() || 'Staff',
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
    <VStack gap={3} align="stretch" maxW="440px" mx="auto" w="100%">
      {/* 1. Header with Add Button */}
      <Flex justify="space-between" align="center" px={1}>
        <Box>
          <Text fontSize="14px" fontWeight="700" color="#0f172a">
            Staff Members ({helpers.length})
          </Text>
        </Box>

        <button
          onClick={openAddModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 12px',
            borderRadius: '9999px',
            border: 'none',
            background: '#0f172a',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>Add Staff</span>
        </button>
      </Flex>

      {/* 2. Staff Cards */}
      <VStack gap={2} align="stretch">
        {helpers.map((h) => (
          <Box
            key={h.id}
            bg="#ffffff"
            borderRadius="xl"
            p={3}
            border="1px solid #e2e8f0"
            boxShadow="0 1px 2px rgba(0, 0, 0, 0.02)"
          >
            <Flex justify="space-between" align="center">
              <HStack gap={2.5}>
                <Text fontSize="20px">{h.avatarEmoji}</Text>
                <Box>
                  <Text fontSize="13px" fontWeight="700" color="#0f172a">
                    {h.name}
                  </Text>
                  <Text fontSize="11px" color="#64748b">
                    {h.role} • {formatCurrency(h.baseSalary)}
                    {h.salaryType === 'DAILY_WAGE' ? '/day' : '/mo'}
                  </Text>
                  <Text fontSize="10px" color="#94a3b8">
                    {h.paidLeavesAllowance} free leaves • Off: {h.weeklyOffDay >= 0 ? WEEKDAY_NAMES[h.weeklyOffDay] : 'None'}
                  </Text>
                </Box>
              </HStack>

              <HStack gap={1}>
                <button
                  onClick={() => openEditModal(h)}
                  title="Edit"
                  style={{
                    padding: '5px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    color: '#64748b',
                  }}
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove ${h.name}?`)) {
                      onDeleteHelper(h.id);
                    }
                  }}
                  title="Delete"
                  style={{
                    padding: '5px',
                    borderRadius: '6px',
                    border: '1px solid #fee2e2',
                    background: '#fef2f2',
                    cursor: 'pointer',
                    color: '#ef4444',
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </HStack>
            </Flex>
          </Box>
        ))}
      </VStack>

      {/* 3. Minimal Backup / Reset Footer */}
      <Flex justify="center" gap={3} pt={3} pb={6} fontSize="11px" color="#94a3b8">
        <button
          onClick={onExportBackup}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}
        >
          <Download size={11} /> Backup
        </button>
        <span>•</span>
        <button
          onClick={() => setIsImportModalOpen(true)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}
        >
          <Upload size={11} /> Restore
        </button>
        <span>•</span>
        <button
          onClick={onResetDemo}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}
        >
          <RotateCcw size={11} /> Reset Demo
        </button>
      </Flex>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <Box
          position="fixed"
          inset={0}
          bg="rgba(15, 23, 42, 0.4)"
          backdropFilter="blur(4px)"
          display="flex"
          alignItems={{ base: 'flex-end', sm: 'center' }}
          justifyContent="center"
          zIndex={100}
          p={{ base: 0, sm: 4 }}
        >
          <Box
            bg="#ffffff"
            borderRadius={{ base: '24px 24px 0 0', sm: '20px' }}
            maxW="360px"
            w="100%"
            maxH="88vh"
            overflowY="auto"
            p={4}
            boxShadow="0 20px 40px rgba(0,0,0,0.12)"
            border="1px solid #e2e8f0"
          >
            <Flex justify="space-between" align="center" mb={3}>
              <Text fontSize="13px" fontWeight="700" color="#0f172a">
                {editingHelper ? 'Edit Staff' : 'Add Staff'}
              </Text>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={16} />
              </button>
            </Flex>

            <VStack gap={2.5} align="stretch">
              {/* Name */}
              <Box>
                <Text fontSize="11px" fontWeight="600" color="#64748b" mb={0.5}>
                  Name
                </Text>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Sunita"
                  style={{
                    width: '100%',
                    padding: '7px 9px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
              </Box>

              {/* Role */}
              <Box>
                <Text fontSize="11px" fontWeight="600" color="#64748b" mb={0.5}>
                  Role
                </Text>
                <Flex gap={1} wrap="wrap" mb={1}>
                  {PRESET_ROLES.map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => {
                        setFormRole(r.role);
                        setFormEmoji(r.emoji);
                      }}
                      style={{
                        padding: '2px 7px',
                        borderRadius: '9999px',
                        border: '1px solid',
                        borderColor: formRole === r.role ? '#0f172a' : '#e2e8f0',
                        background: formRole === r.role ? '#0f172a' : '#ffffff',
                        color: formRole === r.role ? '#ffffff' : '#64748b',
                        fontSize: '10px',
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
                    padding: '6px 9px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px',
                    outline: 'none',
                  }}
                />
              </Box>

              {/* Emoji */}
              <Box>
                <Text fontSize="11px" fontWeight="600" color="#64748b" mb={0.5}>
                  Icon
                </Text>
                <Flex gap={1} wrap="wrap">
                  {EMOJI_OPTIONS.map((em) => (
                    <Box
                      key={em}
                      onClick={() => setFormEmoji(em)}
                      w="28px"
                      h="28px"
                      borderRadius="md"
                      border="1px solid"
                      borderColor={formEmoji === em ? '#0f172a' : '#f1f5f9'}
                      bg={formEmoji === em ? '#f8fafc' : '#ffffff'}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="15px"
                      cursor="pointer"
                    >
                      {em}
                    </Box>
                  ))}
                </Flex>
              </Box>

              {/* Salary Model */}
              <Box>
                <Text fontSize="11px" fontWeight="600" color="#64748b" mb={0.5}>
                  Salary Type
                </Text>
                <SimpleGrid columns={3} gap={1}>
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
                        padding: '5px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: formSalaryType === s.type ? '#0f172a' : '#e2e8f0',
                        background: formSalaryType === s.type ? '#0f172a' : '#ffffff',
                        color: formSalaryType === s.type ? '#ffffff' : '#64748b',
                        fontSize: '10px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </SimpleGrid>
              </Box>

              {/* Amount & Free Leaves */}
              <SimpleGrid columns={2} gap={1.5}>
                <Box>
                  <Text fontSize="11px" fontWeight="600" color="#64748b" mb={0.5}>
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
                      padding: '6px 9px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      fontWeight: '600',
                      outline: 'none',
                    }}
                  />
                </Box>
                <Box>
                  <Text fontSize="11px" fontWeight="600" color="#64748b" mb={0.5}>
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
                      padding: '6px 9px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                </Box>
              </SimpleGrid>

              {/* Weekly off */}
              <Box>
                <Text fontSize="11px" fontWeight="600" color="#64748b" mb={0.5}>
                  Weekly Off
                </Text>
                <select
                  value={formWeeklyOff}
                  onChange={(e) => setFormWeeklyOff(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '6px 9px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px',
                    outline: 'none',
                    color: '#0f172a',
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

            <Flex justify="flex-end" gap={1.5} mt={4}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '600',
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
          bg="rgba(15, 23, 42, 0.4)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={100}
          p={3}
        >
          <Box bg="#ffffff" borderRadius="xl" maxW="340px" w="100%" p={4} border="1px solid #e2e8f0">
            <Text fontSize="12px" fontWeight="700" mb={2}>
              Restore JSON Backup
            </Text>
            <textarea
              rows={4}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON..."
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '11px',
                outline: 'none',
                marginBottom: '8px',
              }}
            />
            <Flex justify="flex-end" gap={1.5}>
              <button
                onClick={() => setIsImportModalOpen(false)}
                style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', background: '#0f172a', color: '#fff', fontSize: '11px', fontWeight: 600 }}
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
