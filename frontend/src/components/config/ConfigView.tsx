"use client";

import React, { useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react';
import { HelperColorTheme, HouseHelp, SalaryType } from '@/types';
import { formatCurrency } from '@/utils/dateUtils';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Download,
  Upload,
  RotateCcw,
  Phone,
  FileText,
} from 'lucide-react';

interface ConfigViewProps {
  helpers: HouseHelp[];
  onSaveHelper: (helper: HouseHelp) => void;
  onDeleteHelper: (id: string) => void;
  onResetDemo: () => void;
  onExportBackup: () => void;
  onImportBackup: (json: string) => boolean;
}

const EMOJI_OPTIONS = ['👩‍🍳', '🧹', '🚗', '👶', '🌿', '🧺', '🛡️', '🧑‍🌾', '🌸', '✨', '☕', '🍲', '🧼', '🐕', '🌷', '👗'];

const COLOR_OPTIONS: { theme: HelperColorTheme; hex: string; name: string }[] = [
  { theme: 'pink', hex: '#ec4899', name: 'Strawberry Pink' },
  { theme: 'purple', hex: '#8b5cf6', name: 'Lavender Mist' },
  { theme: 'teal', hex: '#14b8a6', name: 'Soft Mint' },
  { theme: 'orange', hex: '#f97316', name: 'Warm Peach' },
  { theme: 'blue', hex: '#0ea5e9', name: 'Sky Dream' },
  { theme: 'emerald', hex: '#10b981', name: 'Fresh Emerald' },
];

const PRESET_ROLES = [
  { role: 'Cook / Chef', emoji: '👩‍🍳' },
  { role: 'Housekeeper / Maid', emoji: '🧹' },
  { role: 'Driver', emoji: '🚗' },
  { role: 'Babysitter / Nanny', emoji: '👶' },
  { role: 'Gardener', emoji: '🌿' },
  { role: 'Ironing / Laundry', emoji: '🧺' },
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
  const [formColor, setFormColor] = useState<HelperColorTheme>('pink');
  const [formSalaryType, setFormSalaryType] = useState<SalaryType>('FIXED_MONTHLY');
  const [formBaseSalary, setFormBaseSalary] = useState<number>(7000);
  const [formPaidLeaves, setFormPaidLeaves] = useState<number>(2);
  const [formWeeklyOff, setFormWeeklyOff] = useState<number>(0); // 0 = Sunday
  const [formPhone, setFormPhone] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const openAddModal = () => {
    setEditingHelper(null);
    setFormName('');
    setFormRole('Cook / Chef');
    setFormEmoji('👩‍🍳');
    setFormColor('pink');
    setFormSalaryType('FIXED_MONTHLY');
    setFormBaseSalary(7000);
    setFormPaidLeaves(2);
    setFormWeeklyOff(0);
    setFormPhone('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (h: HouseHelp) => {
    setEditingHelper(h);
    setFormName(h.name);
    setFormRole(h.role);
    setFormEmoji(h.avatarEmoji);
    setFormColor(h.colorTheme || 'pink');
    setFormSalaryType(h.salaryType);
    setFormBaseSalary(h.baseSalary);
    setFormPaidLeaves(h.paidLeavesAllowance);
    setFormWeeklyOff(h.weeklyOffDay);
    setFormPhone(h.phone || '');
    setFormNotes(h.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim()) {
      alert('Please enter a name for the house help');
      return;
    }

    const helperToSave: HouseHelp = {
      id: editingHelper ? editingHelper.id : `helper_${Date.now()}`,
      name: formName.trim(),
      role: formRole.trim() || 'House Staff',
      avatarEmoji: formEmoji,
      colorTheme: formColor,
      salaryType: formSalaryType,
      baseSalary: Math.max(0, Number(formBaseSalary) || 0),
      paidLeavesAllowance: Math.max(0, Number(formPaidLeaves) || 0),
      weeklyOffDay: Number(formWeeklyOff),
      phone: formPhone.trim(),
      notes: formNotes.trim(),
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
      alert('Data imported successfully!');
      setIsImportModalOpen(false);
      setImportJsonText('');
    } else {
      alert('Failed to parse JSON. Please verify the backup file format.');
    }
  };

  return (
    <VStack gap={6} align="stretch" maxW="1400px" mx="auto" w="100%">
      {/* 1. Header & Actions */}
      <Box
        bg="#ffffff"
        borderRadius="3xl"
        p={{ base: 5, md: 7 }}
        border="2px solid #ffd4dc"
        boxShadow="0 10px 30px -10px rgba(255, 107, 139, 0.15)"
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'flex-start', md: 'center' }}
          justify="space-between"
          gap={4}
        >
          <Box>
            <HStack gap={2}>
              <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" color="#831843">
                Manage House Staff & Salaries
              </Text>
              <Badge
                bg="#fdf2f8"
                color="#be185d"
                border="1px solid #fbcfe8"
                borderRadius="full"
                px={2.5}
                py={0.5}
                fontWeight="700"
              >
                {helpers.length} registered
              </Badge>
            </HStack>
            <Text fontSize="xs" color="#64748b" mt={1}>
              Configure monthly pay, daily rates, paid leave quotas, and off-day rules for each team member.
            </Text>
          </Box>

          <HStack gap={2} wrap="wrap">
            <button
              onClick={openAddModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
              }}
            >
              <Plus size={16} strokeWidth={3} />
              <span>Add New Staff</span>
            </button>

            <button
              onClick={onExportBackup}
              title="Download Data Backup"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                borderRadius: '16px',
                border: '1.5px solid #e2e8f0',
                background: '#ffffff',
                color: '#475569',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              <Download size={14} />
              <span>Backup</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              title="Import Data"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                borderRadius: '16px',
                border: '1.5px solid #e2e8f0',
                background: '#ffffff',
                color: '#475569',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              <Upload size={14} />
              <span>Restore</span>
            </button>

            <button
              onClick={onResetDemo}
              title="Reset to Sample Staff"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                borderRadius: '16px',
                border: '1.5px solid #fed7e2',
                background: '#fff0f4',
                color: '#be185d',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} />
              <span>Reset Demo</span>
            </button>
          </HStack>
        </Flex>
      </Box>

      {/* 2. Staff Cards Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
        {helpers.map((h) => {
          return (
            <Box
              key={h.id}
              bg="#ffffff"
              borderRadius="3xl"
              p={5}
              border="2px solid #ffd4dc"
              boxShadow="0 6px 18px -4px rgba(255, 107, 139, 0.1)"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-2px)', borderColor: '#f43f5e' }}
            >
              <Box>
                <Flex justify="space-between" align="flex-start" mb={3}>
                  <HStack gap={3}>
                    <Box
                      w="52px"
                      h="52px"
                      borderRadius="2xl"
                      bg="#fff1f2"
                      border="2px solid #fecdd3"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="26px"
                      boxShadow="sm"
                    >
                      {h.avatarEmoji}
                    </Box>
                    <Box>
                      <Text fontSize="md" fontWeight="800" color="#1e293b">
                        {h.name}
                      </Text>
                      <Badge
                        bg="#fdf2f8"
                        color="#be185d"
                        border="1px solid #fbcfe8"
                        borderRadius="full"
                        px={2}
                        py={0.2}
                        fontSize="10px"
                        fontWeight="700"
                      >
                        {h.role}
                      </Badge>
                    </Box>
                  </HStack>

                  <HStack gap={1}>
                    <button
                      onClick={() => openEditModal(h)}
                      title="Edit Helper"
                      style={{
                        padding: '6px',
                        borderRadius: '10px',
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
                        if (confirm(`Are you sure you want to delete ${h.name}? This will also delete their attendance records.`)) {
                          onDeleteHelper(h.id);
                        }
                      }}
                      title="Delete Helper"
                      style={{
                        padding: '6px',
                        borderRadius: '10px',
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

                {/* Compensation info */}
                <Box
                  p={3}
                  borderRadius="2xl"
                  bg="#fffafb"
                  border="1.5px solid #ffe4e6"
                  mb={3}
                  fontSize="12px"
                >
                  <Flex justify="space-between" mb={1}>
                    <Text color="#64748b">Salary Model:</Text>
                    <Text fontWeight="700" color="#831843">
                      {h.salaryType === 'FIXED_MONTHLY' && 'Fixed Monthly'}
                      {h.salaryType === 'DAILY_WAGE' && 'Daily Wage'}
                      {h.salaryType === 'STRICT_FLAT' && 'Strict Flat'}
                    </Text>
                  </Flex>

                  <Flex justify="space-between" mb={1}>
                    <Text color="#64748b">Base Amount:</Text>
                    <Text fontWeight="800" color="#0f172a">
                      {formatCurrency(h.baseSalary)}{' '}
                      <span style={{ fontSize: '10px', color: '#64748b' }}>
                        {h.salaryType === 'DAILY_WAGE' ? '/ day' : '/ month'}
                      </span>
                    </Text>
                  </Flex>

                  <Flex justify="space-between" mb={1}>
                    <Text color="#64748b">Paid Leaves Quota:</Text>
                    <Text fontWeight="700" color="#15803d">
                      {h.paidLeavesAllowance} days / mo
                    </Text>
                  </Flex>

                  <Flex justify="space-between">
                    <Text color="#64748b">Weekly Off:</Text>
                    <Text fontWeight="700" color="#475569">
                      {h.weeklyOffDay >= 0 ? WEEKDAY_NAMES[h.weeklyOffDay] : 'None'}
                    </Text>
                  </Flex>
                </Box>

                {/* Phone & Notes */}
                {(h.phone || h.notes) && (
                  <VStack gap={1} align="stretch" fontSize="11px" color="#64748b">
                    {h.phone && (
                      <HStack gap={1.5}>
                        <Phone size={12} color="#ec4899" />
                        <Text>{h.phone}</Text>
                      </HStack>
                    )}
                    {h.notes && (
                      <HStack gap={1.5} align="flex-start">
                        <FileText size={12} color="#8b5cf6" style={{ marginTop: '2px' }} />
                        <Text lineClamp={2}>{h.notes}</Text>
                      </HStack>
                    )}
                  </VStack>
                )}
              </Box>

              <Box pt={3} mt={3} borderTop="1px dashed #fed7e2" fontSize="10px" color="#94a3b8">
                Joined: {h.joinDate || 'Active staff'}
              </Box>
            </Box>
          );
        })}
      </SimpleGrid>

      {/* 3. Add / Edit Helper Modal */}
      {isModalOpen && (
        <Box
          position="fixed"
          inset={0}
          bg="rgba(15, 23, 42, 0.6)"
          backdropFilter="blur(5px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={100}
          p={4}
        >
          <Box
            bg="#ffffff"
            borderRadius="3xl"
            border="2px solid #ffd4dc"
            maxW="540px"
            w="100%"
            maxH="90vh"
            overflowY="auto"
            boxShadow="0 25px 50px -12px rgba(255, 107, 139, 0.3)"
          >
            {/* Modal Header */}
            <Flex
              p={5}
              bg="linear-gradient(135deg, #fff0f4 0%, #fdf2f8 100%)"
              borderBottom="1px solid #fecdd3"
              align="center"
              justify="space-between"
            >
              <HStack gap={3}>
                <Box
                  w="42px"
                  h="42px"
                  borderRadius="xl"
                  bg="#ffffff"
                  border="2px solid #fbb6ce"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="22px"
                >
                  {formEmoji}
                </Box>
                <Box>
                  <Text fontSize="lg" fontWeight="800" color="#831843">
                    {editingHelper ? 'Edit Staff Details' : 'Add New House Help'}
                  </Text>
                  <Text fontSize="xs" color="#9d174d">
                    Configure salary model & attendance rules
                  </Text>
                </Box>
              </HStack>

              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #fecdd3',
                  borderRadius: '9999px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: '#9f1239',
                }}
              >
                <X size={16} />
              </button>
            </Flex>

            {/* Modal Form */}
            <VStack p={5} gap={4} align="stretch">
              {/* Name */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="#334155" mb={1}>
                  Full Name *
                </Text>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Sunita Sharma, Ramesh Kumar"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    border: '1.5px solid #fed7e2',
                    background: '#fffafb',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </Box>

              {/* Role Preset Pills */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="#334155" mb={1.5}>
                  Role / Responsibility
                </Text>
                <Flex gap={1.5} wrap="wrap" mb={2}>
                  {PRESET_ROLES.map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => {
                        setFormRole(r.role);
                        setFormEmoji(r.emoji);
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        border: '1px solid',
                        borderColor: formRole === r.role ? '#ec4899' : '#e2e8f0',
                        background: formRole === r.role ? '#fdf2f8' : '#ffffff',
                        color: formRole === r.role ? '#be185d' : '#475569',
                        fontSize: '11px',
                        fontWeight: '600',
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
                  placeholder="Custom role name"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '1px solid #fed7e2',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
              </Box>

              {/* Avatar Emoji Selector */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="#334155" mb={1}>
                  Avatar Icon
                </Text>
                <Flex gap={2} wrap="wrap">
                  {EMOJI_OPTIONS.map((em) => (
                    <Box
                      key={em}
                      onClick={() => setFormEmoji(em)}
                      w="36px"
                      h="36px"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor={formEmoji === em ? '#ec4899' : '#f1f5f9'}
                      bg={formEmoji === em ? '#fdf2f8' : '#ffffff'}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="20px"
                      cursor="pointer"
                      transition="all 0.15s"
                    >
                      {em}
                    </Box>
                  ))}
                </Flex>
              </Box>

              {/* Theme Color Picker */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="#334155" mb={1}>
                  Theme Color Badge
                </Text>
                <Flex gap={2} wrap="wrap">
                  {COLOR_OPTIONS.map((c) => {
                    const isSelected = formColor === c.theme;
                    return (
                      <Box
                        key={c.theme}
                        onClick={() => setFormColor(c.theme)}
                        w="32px"
                        h="32px"
                        borderRadius="xl"
                        bg={c.hex}
                        cursor="pointer"
                        border="2px solid"
                        borderColor={isSelected ? '#0f172a' : 'transparent'}
                        boxShadow={isSelected ? '0 0 0 2px #f43f5e' : 'none'}
                        title={c.name}
                        transition="all 0.15s"
                      />
                    );
                  })}
                </Flex>
              </Box>

              {/* Salary Structure */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="#334155" mb={1.5}>
                  Salary Type / Compensation Model
                </Text>
                <SimpleGrid columns={3} gap={2}>
                  {[
                    { type: 'FIXED_MONTHLY', label: 'Fixed Monthly', desc: 'Per month with paid leaves' },
                    { type: 'DAILY_WAGE', label: 'Daily Wage', desc: 'Paid per active day worked' },
                    { type: 'STRICT_FLAT', label: 'Flat Stipend', desc: 'No leave deductions' },
                  ].map((s) => {
                    const isSelected = formSalaryType === s.type;
                    return (
                      <Box
                        key={s.type}
                        onClick={() => setFormSalaryType(s.type as SalaryType)}
                        p={2.5}
                        borderRadius="xl"
                        border="2px solid"
                        borderColor={isSelected ? '#ec4899' : '#e2e8f0'}
                        bg={isSelected ? '#fdf2f8' : '#ffffff'}
                        cursor="pointer"
                        textAlign="center"
                      >
                        <Text fontSize="12px" fontWeight={isSelected ? '800' : '600'} color={isSelected ? '#be185d' : '#334155'}>
                          {s.label}
                        </Text>
                        <Text fontSize="9px" color="#64748b" mt={0.5}>
                          {s.desc}
                        </Text>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </Box>

              {/* Base Salary Amount & Paid Leaves Allowance */}
              <SimpleGrid columns={2} gap={3}>
                <Box>
                  <Text fontSize="xs" fontWeight="700" color="#334155" mb={1}>
                    {formSalaryType === 'DAILY_WAGE' ? 'Daily Wage Rate (₹) *' : 'Monthly Salary (₹) *'}
                  </Text>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formBaseSalary}
                    onChange={(e) => setFormBaseSalary(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '14px',
                      border: '1.5px solid #fed7e2',
                      background: '#fffafb',
                      fontSize: '13px',
                      fontWeight: '700',
                      outline: 'none',
                    }}
                  />
                </Box>

                <Box>
                  <Text fontSize="xs" fontWeight="700" color="#334155" mb={1}>
                    Allowed Paid Leaves / Month
                  </Text>
                  <input
                    type="number"
                    min="0"
                    max="31"
                    value={formPaidLeaves}
                    onChange={(e) => setFormPaidLeaves(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '14px',
                      border: '1.5px solid #fed7e2',
                      background: '#fffafb',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </Box>
              </SimpleGrid>

              {/* Weekly Off Day */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="#334155" mb={1}>
                  Weekly Off Day
                </Text>
                <select
                  value={formWeeklyOff}
                  onChange={(e) => setFormWeeklyOff(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    border: '1.5px solid #fed7e2',
                    background: '#fffafb',
                    fontSize: '13px',
                    outline: 'none',
                    color: '#334155',
                  }}
                >
                  <option value={-1}>None (Works all days)</option>
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
              </Box>

              {/* Phone & Notes */}
              <SimpleGrid columns={2} gap={3}>
                <Box>
                  <Text fontSize="xs" fontWeight="700" color="#334155" mb={1}>
                    Phone Number (Optional)
                  </Text>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      border: '1px solid #fed7e2',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="700" color="#334155" mb={1}>
                    Notes / Reminders (Optional)
                  </Text>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Timings, preferences, food..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      border: '1px solid #fed7e2',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                </Box>
              </SimpleGrid>
            </VStack>

            {/* Modal Footer */}
            <Flex
              p={4}
              bg="#f8fafc"
              borderTop="1px solid #e2e8f0"
              justify="flex-end"
              gap={2}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '14px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                style={{
                  padding: '8px 24px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
                }}
              >
                {editingHelper ? 'Update Staff' : 'Save Staff'}
              </button>
            </Flex>
          </Box>
        </Box>
      )}

      {/* 4. Restore / Import Modal */}
      {isImportModalOpen && (
        <Box
          position="fixed"
          inset={0}
          bg="rgba(15, 23, 42, 0.6)"
          backdropFilter="blur(5px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={100}
          p={4}
        >
          <Box
            bg="#ffffff"
            borderRadius="3xl"
            border="2px solid #ffd4dc"
            maxW="480px"
            w="100%"
            p={6}
            boxShadow="0 25px 50px -12px rgba(255, 107, 139, 0.3)"
          >
            <HStack justify="space-between" mb={3}>
              <Text fontSize="lg" fontWeight="800" color="#831843">
                Restore Data Backup
              </Text>
              <button
                onClick={() => setIsImportModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={16} />
              </button>
            </HStack>

            <Text fontSize="xs" color="#64748b" mb={3}>
              Paste your exported JSON backup below to restore your staff records and attendance:
            </Text>

            <textarea
              rows={6}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON content here..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '12px',
                border: '1.5px solid #fed7e2',
                fontSize: '12px',
                fontFamily: 'monospace',
                outline: 'none',
                marginBottom: '16px',
              }}
            />

            <Flex justify="flex-end" gap={2}>
              <button
                onClick={() => setIsImportModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleImportSubmit}
                style={{
                  padding: '8px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#059669',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Import Backup
              </button>
            </Flex>
          </Box>
        </Box>
      )}
    </VStack>
  );
};
