'use client'

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Document {
  id: number;
  name: string;
  created: string;
}

interface DocumentViewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
}

const DocumentViewPopup: React.FC<DocumentViewPopupProps> = ({ isOpen, onClose, documents }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Document List</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">No</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc, index) => (
              <TableRow key={doc.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{doc.name}</TableCell>
                <TableCell>{doc.created}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewPopup;