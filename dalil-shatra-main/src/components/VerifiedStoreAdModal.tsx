import React from 'react';
import { AdvertiseModal } from './AdvertiseModal';
import { DirectoryItem } from '../types/directory';

interface VerifiedStoreAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenClaimStore?: (store?: DirectoryItem) => void;
  initialScope?: 'national' | 'governorate' | 'store_area';
}

/**
 * Single source of truth for paid ads. Legacy entry points are intentionally
 * routed to the same verified-store -> payment -> admin approval workflow.
 */
export const VerifiedStoreAdModal: React.FC<VerifiedStoreAdModalProps> = ({ isOpen, onClose }) => (
  <AdvertiseModal isOpen={isOpen} onClose={onClose} />
);
