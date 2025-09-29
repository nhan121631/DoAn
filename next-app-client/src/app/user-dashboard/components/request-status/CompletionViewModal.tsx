"use client";

import { Modal, Image, Typography } from "antd";

const { Text, Paragraph } = Typography;

interface CompletionViewModalProps {
  open: boolean;
  onCancel: () => void;
  description?: string;
  imageUrl?: string;
  roomTitle?: string;
}

const CompletionViewModal: React.FC<CompletionViewModalProps> = ({
  open,
  onCancel,
  description,
  imageUrl,
  roomTitle,
}) => {
  const getImageUrl = (imageUrl?: string): string => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `https://res.cloudinary.com${imageUrl}`;
  };

  return (
    <Modal
      title={`Completion Details`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      centered
    >
      <div className="space-y-4">
        <div>
          <Text strong className="block mb-2">Completion Description:</Text>
          <Paragraph className="p-3 rounded bg-gray-50">
            {description || 'No description provided'}
          </Paragraph>
        </div>

        {imageUrl && (
          <div>
            <Text strong className="block mb-2">Completion Image:</Text>
            <div className="text-center">
              <Image
                src={getImageUrl(imageUrl)}
                alt="Completion image"
                style={{ maxWidth: '100%', maxHeight: '400px' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CompletionViewModal;