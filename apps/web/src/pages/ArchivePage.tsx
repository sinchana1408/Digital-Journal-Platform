import React from 'react';
import { JournalListPage } from './JournalListPage';

export const ArchivePage: React.FC = () => {
  return (
    <JournalListPage
      initialStatus="archived"
      pageTitle="Archived Reflections"
      pageSubtitle="Past thoughts and legacy drafts stored safely outside your active journal"
    />
  );
};
