import React from 'react';
import { Paper, Tabs, ScrollArea, Box } from '@mantine/core';
import { SelectedEntityType } from '@/utility/types';

interface EntityInfoPopupProps<T> {
  selectedEntity: T;
  tabs?: { id: string; label: string }[];
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  renderContent: (entity: T) => React.ReactNode;
  renderHeader: (entity: T) => React.ReactNode;
}

const EntityInfoPopup = <T extends SelectedEntityType>({
  selectedEntity,
  tabs,
  activeTab,
  setActiveTab,
  renderContent,
  renderHeader,
}: EntityInfoPopupProps<T>) => {
  if (!selectedEntity) return null;

  const hasTabs = tabs && tabs.length > 0;

  return (
    <Paper
      shadow="xl"
      radius="md"
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        right: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: 'rgba(37, 38, 43, 0.9)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        pointerEvents: 'auto',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
      styles={{
        root: {
          '@media (min-width: 640px)': {
            top: 'auto',
            bottom: 40,
            right: 16,
            width: 384,
            height: 'calc(80vh)',
            borderRadius: 'var(--mantine-radius-md)',
          },
        },
      }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {renderHeader(selectedEntity)}
        
        {hasTabs && activeTab && setActiveTab ? (
          <>
            <Box
              px="sm"
              py="xs"
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(26, 27, 30, 0.6)',
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(value) => setActiveTab(value || tabs[0].id)}
                variant="pills"
              >
                <Tabs.List>
                  {tabs.map((tab) => (
                    <Tabs.Tab
                      key={tab.id}
                      value={tab.id}
                      size="sm"
                      styles={{
                        tab: {
                          fontSize: '0.8rem',
                          padding: '6px 12px',
                        },
                      }}
                    >
                      {tab.label}
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs>
            </Box>
            <ScrollArea style={{ flex: 1 }} p="sm">
              {renderContent(selectedEntity)}
            </ScrollArea>
          </>
        ) : (
          <ScrollArea style={{ flex: 1 }} p="sm">
            {renderContent(selectedEntity)}
          </ScrollArea>
        )}
      </Box>
    </Paper>
  );
};

export default EntityInfoPopup;
