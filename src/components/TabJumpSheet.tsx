import { useState } from 'react';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useTranslation } from 'react-i18next';

import { APP_FROSTED_GLASS_SURFACE_PROPS } from '@/src/lib/appGlass';
import { cn } from '@/src/lib/utils';
import { statusColor, useTheme } from '@/src/theme';
import { GlassSurface } from './GlassSurface';
import { Text } from './ui/text';

export interface TabJumpItem {
  id: string;
  label: string;
  agentStatus: string;
  current: boolean;
  onSelect: () => void;
}

export interface TabJumpSection {
  id: string;
  title?: string;
  items: TabJumpItem[];
}

interface Props {
  visible: boolean;
  sections: TabJumpSection[];
  onClose: () => void;
}

export function TabJumpSheet({ visible, sections, onClose }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const filtered = sections
    .map(section => ({
      ...section,
      items: needle && !section.title?.toLowerCase().includes(needle)
        ? section.items.filter(item => item.label.toLowerCase().includes(needle))
        : section.items,
    }))
    .filter(section => section.items.length);
  const close = () => {
    setQuery('');
    onClose();
  };
  const select = (item: TabJumpItem) => {
    close();
    item.onSelect();
  };

  if (!visible) return null;
  return (
    <Modal animationType="fade" onRequestClose={close} statusBarTranslucent transparent visible>
      <KeyboardAvoidingView behavior="padding" automaticOffset className="flex-1 justify-center px-4">
        <Pressable accessibilityLabel={t('common.cancel')} className="absolute inset-0 bg-black/55" onPress={close} />
        <GlassSurface
          {...APP_FROSTED_GLASS_SURFACE_PROPS}
          accessibilityViewIsModal
          className="max-h-[80%] w-full self-center rounded-[28px] border border-white/30 px-3 py-4 dark:border-white/10">
          <Text className="px-2 text-[19px] font-bold leading-6">{t('terminal.tabJump.title')}</Text>
          <TextInput
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            className="mt-3 h-11 rounded-full bg-border px-4 text-[15px] text-foreground"
            placeholder={t('terminal.tabJump.filter')}
            placeholderTextColor={colors.textTertiary}
            returnKeyType="go"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => {
              const first = filtered[0]?.items[0];
              if (first) select(first);
            }}
          />
          <ScrollView className="mt-2" keyboardShouldPersistTaps="handled">
            {filtered.length ? filtered.map(section => (
              <View key={section.id} className="mt-2">
                {section.title ? (
                  <Text className="px-2 pb-1 text-[11px] font-semibold uppercase text-muted-foreground" numberOfLines={1}>
                    {section.title}
                  </Text>
                ) : null}
                {section.items.map(item => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: item.current }}
                    className={cn('h-11 flex-row items-center gap-3 rounded-xl px-3 active:bg-border', item.current && 'bg-primary/15')}
                    onPress={() => select(item)}>
                    <View className="size-2.5 rounded-full" style={{ backgroundColor: statusColor(item.agentStatus, colors) }} />
                    <Text className={cn('min-w-0 flex-1 text-[15px]', item.current && 'font-semibold')} numberOfLines={1}>
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )) : (
              <Text className="px-2 py-4 text-muted-foreground">{t('terminal.tabJump.empty')}</Text>
            )}
          </ScrollView>
        </GlassSurface>
      </KeyboardAvoidingView>
    </Modal>
  );
}
