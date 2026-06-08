export interface ObligationChangeDetailsLang {
  cards: {
    details: string;
    current: string;
    upcoming: string;
  };
  status: {
    unread: string;
    read: string;
  };
  details: {
    status: string;
    effectiveDate: string;
    regulatoryBody: string;
    referenceCode: string;
    tags: string;
  };
}

export interface ObligationChangeDetailsState {
  currentDescription?: string;
  currentVersion?: string;
  upcomingDescription: string;
  upcomingVersion?: string;
  effectiveDate: string;
  status: 'unread' | 'read';
  regulatoryBody: string;
  referenceCode: string;
  tags?: string[];
}
