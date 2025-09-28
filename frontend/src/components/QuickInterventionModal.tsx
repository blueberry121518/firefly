import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { 
  Radio, 
  X, 
  Users, 
  AlertTriangle, 
  MapPin, 
  Shield,
  Zap
} from 'lucide-react';

interface QuickInterventionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction?: (action: string) => void;
}

export function QuickInterventionModal({ 
  open, 
  onOpenChange, 
  onAction 
}: QuickInterventionModalProps) {
  const handleAction = (action: string) => {
    onAction?.(action);
    onOpenChange(false);
  };

  const interventionActions = [
    {
      id: 'dispatch',
      label: 'Dispatch',
      icon: Radio,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      hoverColor: 'hover:bg-blue-500/20'
    },
    {
      id: 'cancel',
      label: 'Cancel',
      icon: X,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      hoverColor: 'hover:bg-red-500/20'
    },
    {
      id: 'reassign',
      label: 'Reassign',
      icon: Users,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
      hoverColor: 'hover:bg-green-500/20'
    },
    {
      id: 'priority',
      label: 'Priority',
      icon: AlertTriangle,
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-400',
      hoverColor: 'hover:bg-yellow-500/20'
    },
    {
      id: 'vehicle-send',
      label: 'Vehicle Send',
      icon: MapPin,
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      hoverColor: 'hover:bg-purple-500/20'
    },
    {
      id: 'override',
      label: 'Override',
      icon: Shield,
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      hoverColor: 'hover:bg-orange-500/20'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-black/95 backdrop-blur-sm border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-white">
            Emergency Intervention
          </DialogTitle>
          <DialogDescription>
            Select an emergency intervention action to perform immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 pt-2">

          {/* Action Grid */}
          <div className="grid grid-cols-2 gap-3">
            {interventionActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  onClick={() => handleAction(action.id)}
                  className={`
                    h-18 flex flex-col items-center justify-center space-y-2 
                    bg-black/60 border-2 transition-all duration-200
                    ${action.borderColor} ${action.textColor} ${action.hoverColor}
                    hover:scale-105 active:scale-95 hover:bg-black/80
                  `}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              );
            })}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}