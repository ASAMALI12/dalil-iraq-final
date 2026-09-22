import React from 'react';
import { AdvertiseModal } from './AdvertiseModal';

interface CategoryAdBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  governorateId: string;
  governorateName: string;
  districtId: string;
  districtName: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
}

export const CategoryAdBookingModal: React.FC<CategoryAdBookingModalProps> = ({ isOpen, onClose }) => (
  <AdvertiseModal isOpen={isOpen} onClose={onClose} />
);
