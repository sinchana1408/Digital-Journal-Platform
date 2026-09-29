import React from 'react';
import { JournalListPage } from './JournalListPage';

export const FavoritesPage: React.FC = () => {
  return (
    <JournalListPage
      initialStatus="favorites"
      pageTitle="Favorite Reflections"
      pageSubtitle="Your cherished memories and standout thoughts in one place"
    />
  );
};
