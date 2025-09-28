import React, { useState } from 'react';
import { Button } from './ui/button';
import { QuickInterventionModal } from './QuickInterventionModal';
import { Zap } from 'lucide-react';

interface QuickInterventionButtonProps {
  className?: string;
  onAction?: (action: string) => void;
}

export function QuickInterventionButton({ 
  className, 
  onAction 
}: QuickInterventionButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleAction = (action: string) => {
    console.log(`Quick Intervention: ${action}`);
    
    // Handle different actions
    switch (action) {
      case 'dispatch':
        console.log('Initiating emergency dispatch...');
        break;
      case 'cancel':
        console.log('Cancelling current operation...');
        break;
      case 'reassign':
        console.log('Reassigning emergency units...');
        break;
      case 'priority':
        console.log('Adjusting priority level...');
        break;
      case 'vehicle-send':
        console.log('Sending additional vehicles...');
        break;
      case 'override':
        console.log('System override activated...');
        break;
      default:
        console.log('Unknown action:', action);
    }
    
    onAction?.(action);
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setModalOpen(true)}
        className={`
          w-full justify-start h-auto py-2 px-3
          text-foreground hover:bg-accent hover:text-accent-foreground
          transition-all duration-200
          ${className}
        `}
      >
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-medium">Emergency Intervention</span>
        </div>
      </Button>

      <QuickInterventionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAction={handleAction}
      />
    </>
  );
}