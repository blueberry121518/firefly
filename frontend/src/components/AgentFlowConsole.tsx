import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Shield, 
  Map, 
  Database, 
  Gavel, 
  Megaphone, 
  CheckCircle, 
  Users, 
  Brain,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Target,
  Lock,
  Send,
  ExternalLink,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react';

interface PydanticModel {
  label: string;
  value: string;
  confidence: number;
  status: 'processing' | 'complete' | 'error';
}

interface UnitBid {
  unitId: string;
  unitType: 'police' | 'fire' | 'ems';
  bidPrice: number;
  eta: number;
  availability: 'available' | 'busy';
  rank: number;
}

interface VerificationGate {
  status: 'passed' | 'failed' | 'processing';
  message: string;
  conflictReason?: string;
}

export function AgentFlowConsole() {
  const [processingStage, setProcessingStage] = useState<'intake' | 'auction' | 'verification' | 'complete'>('intake');
  const [processingTime, setProcessingTime] = useState(0);
  const [rawTranscript] = useState("Fire and medical needed at 123 Main Street, apartment building, smoke coming from second floor, multiple residents trapped, caller reports unconscious person");
  
  const [pydanticModels, setPydanticModels] = useState<PydanticModel[]>([
    { label: 'Incident Type', value: '', confidence: 0, status: 'processing' },
    { label: 'Risk Assessment', value: '', confidence: 0, status: 'processing' },
    { label: 'Required Units', value: '', confidence: 0, status: 'processing' },
    { label: 'Location Confidence', value: '', confidence: 0, status: 'processing' },
    { label: 'Priority Level', value: '', confidence: 0, status: 'processing' }
  ]);

  const [unitBids, setUnitBids] = useState<UnitBid[]>([]);
  const [optimalMix, setOptimalMix] = useState<string>('');
  const [socialWelfareScore, setSocialWelfareScore] = useState<{ optimal: number; alternative: number }>({ optimal: 0, alternative: 0 });
  
  const [verificationGate, setVerificationGate] = useState<VerificationGate>({
    status: 'processing',
    message: 'Awaiting verification...'
  });

  const [dispatchSent, setDispatchSent] = useState(false);
  const [auditLogId, setAuditLogId] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setProcessingTime(prev => prev + 0.1);
    }, 100);

    // Simulate the 4-stage processing flow
    const processFlow = async () => {
      // Stage 1: Intake & Generative Core (0-2 seconds)
      setTimeout(() => {
        setPydanticModels([
          { label: 'Incident Type', value: 'Fire/Medical Emergency', confidence: 95, status: 'complete' },
          { label: 'Risk Assessment', value: 'High Risk, Active Fire Scene', confidence: 92, status: 'complete' },
          { label: 'Required Units', value: 'Fire: 2 Engines + 1 Ladder, EMS: 2 ALS, Police: 1 Unit', confidence: 89, status: 'complete' },
          { label: 'Location Confidence', value: '123 Main Street (Verified)', confidence: 98, status: 'complete' },
          { label: 'Priority Level', value: 'Critical - Life Threat', confidence: 96, status: 'complete' }
        ]);
        setProcessingStage('auction');
      }, 2000);

      // Stage 2: Auction Results (2-3.5 seconds)
      setTimeout(() => {
        setUnitBids([
          { unitId: 'ENGINE-7', unitType: 'fire', bidPrice: 240, eta: 4, availability: 'available', rank: 1 },
          { unitId: 'ENGINE-12', unitType: 'fire', bidPrice: 280, eta: 6, availability: 'available', rank: 2 },
          { unitId: 'LADDER-3', unitType: 'fire', bidPrice: 320, eta: 5, availability: 'available', rank: 1 },
          { unitId: 'EMS-15', unitType: 'ems', bidPrice: 180, eta: 3, availability: 'available', rank: 1 },
          { unitId: 'EMS-22', unitType: 'ems', bidPrice: 200, eta: 4, availability: 'available', rank: 2 },
          { unitId: 'POLICE-Alpha', unitType: 'police', bidPrice: 120, eta: 4, availability: 'available', rank: 1 }
        ]);
        setOptimalMix('ENGINE-7 ($240, 4min) + LADDER-3 ($320, 5min) + EMS-15 ($180, 3min) + POLICE-Alpha ($120, 4min)');
        setSocialWelfareScore({ optimal: 860, alternative: 1120 });
        setProcessingStage('verification');
      }, 3500);

      // Stage 3: Verification (3.5-4.2 seconds)
      setTimeout(() => {
        setVerificationGate({
          status: 'passed',
          message: 'All safety protocols verified. Resource allocation optimized.'
        });
        setProcessingStage('complete');
      }, 4200);

      // Stage 4: Dispatch Execution (4.2-4.8 seconds)
      setTimeout(() => {
        setDispatchSent(true);
        setAuditLogId('AUD-' + Date.now().toString().slice(-6));
      }, 4800);
    };

    processFlow();

    return () => clearInterval(interval);
  }, []);

  const getStageStatus = (stage: string) => {
    const stages = ['intake', 'auction', 'verification', 'complete'];
    const currentIndex = stages.indexOf(processingStage);
    const stageIndex = stages.indexOf(stage);
    
    if (stageIndex < currentIndex) return 'complete';
    if (stageIndex === currentIndex) return 'processing';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500 animate-pulse';
      case 'pending': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getUnitTypeColor = (type: string) => {
    switch (type) {
      case 'fire': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'ems': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'police': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Processing Timer & Stage Indicator */}
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span>Firefly Agent Processing Pipeline</span>
            </CardTitle>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">
                {processingTime.toFixed(1)}s / 5.0s target
              </Badge>
              <Badge variant={processingTime > 5 ? "destructive" : "default"}>
                {processingTime > 5 ? 'OVERTIME' : 'ON TIME'}
              </Badge>
            </div>
          </div>
          <Progress value={(processingTime / 5) * 100} className="h-2" />
        </CardHeader>
      </Card>

      {/* Stage Progress Indicator */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { stage: 'intake', label: 'Layer 1: Intake → LLM Fact → Routing', icon: <Shield className="w-4 h-4" /> },
          { stage: 'auction', label: 'Layer 2: Fire + Police + EMS Units', icon: <Users className="w-4 h-4" /> },
          { stage: 'verification', label: 'Layer 3: Verifier + Secure Comms', icon: <CheckCircle className="w-4 h-4" /> },
          { stage: 'complete', label: 'Layer 4: Multi-Agency Dispatch', icon: <Send className="w-4 h-4" /> }
        ].map((item, index) => (
          <Card key={item.stage} className={`${getStageStatus(item.stage) === 'complete' ? 'border-green-500/30 bg-green-500/5' : 
            getStageStatus(item.stage) === 'processing' ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-gray-500/30'}`}>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(getStageStatus(item.stage))}`}></div>
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Layer 1: Intake & Structured Processing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Layer 1: Intake → List Out → Routing → Acquire Info</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="text-center p-2 border rounded">
                <div className="w-3 h-3 rounded-full bg-green-400 mx-auto mb-1"></div>
                <p className="text-xs font-medium">Intake Agent</p>
                <p className="text-xs text-muted-foreground">Call Processing</p>
              </div>
              <div className="text-center p-2 border rounded">
                <div className="w-3 h-3 rounded-full bg-purple-400 mx-auto mb-1"></div>
                <p className="text-xs font-medium">LLM Fact Agent</p>
                <p className="text-xs text-muted-foreground">Fact Extraction</p>
              </div>
              <div className="text-center p-2 border rounded">
                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse mx-auto mb-1"></div>
                <p className="text-xs font-medium">Routing Agent</p>
                <p className="text-xs text-muted-foreground">Path Calculation</p>
              </div>
              <div className="text-center p-2 border rounded">
                <div className="w-3 h-3 rounded-full bg-cyan-400 mx-auto mb-1"></div>
                <p className="text-xs font-medium">Secure Comms Agent</p>
                <p className="text-xs text-muted-foreground">Communication Setup</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Raw 911 Call Transcript</h4>
              <div className="p-3 bg-muted rounded-lg text-sm">
                <FileText className="w-4 h-4 inline mr-2" />
                "{rawTranscript}"
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Structured Facts (5 Pydantic Models)</h4>
              <div className="grid grid-cols-1 gap-2">
                {pydanticModels.map((model, index) => (
                  <Card key={index} className="border border-border/50">
                    <CardContent className="pt-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">{model.label}</p>
                          <p className="text-sm">{model.value || 'Processing...'}</p>
                        </div>
                        <div className="text-right">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(model.status)} mb-1`}></div>
                          <span className="text-xs">{model.confidence}%</span>
                        </div>
                      </div>
                      {model.status === 'complete' && (
                        <Progress value={model.confidence} className="h-1 mt-2" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layer 2: Unit Agent Coordination */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Layer 2: Fire ↔ Police ↔ EMS Unit Coordination</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <p className="text-sm font-medium">Fire Unit Agent</p>
                </div>
                <div className="space-y-1 text-xs">
                  <p>• Engine-7: 4min ETA</p>
                  <p>• Ladder-3: 5min ETA</p>
                  <p>• Water supply: Ready</p>
                  <p>• Suppression strategy: Active</p>
                </div>
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <p className="text-sm font-medium">Police Unit Agent</p>
                </div>
                <div className="space-y-1 text-xs">
                  <p>• Police-Alpha: Dispatched</p>
                  <p>• Perimeter: 200ft radius</p>
                  <p>• Traffic control: Active</p>
                  <p>• Evacuation: In progress</p>
                </div>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                  <p className="text-sm font-medium">EMS Unit Agent</p>
                </div>
                <div className="space-y-1 text-xs">
                  <p>• EMS-15: Primary response</p>
                  <p>• EMS-22: Backup ready</p>
                  <p>• Hospital: SFGH trauma ready</p>
                  <p>• Social welfare: 0.847</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Live Unit Bids</h4>
              <div className="space-y-2">
                {unitBids.slice(0, 6).map((bid, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Badge className={getUnitTypeColor(bid.unitType)}>
                        {bid.unitType.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">{bid.unitId}</span>
                      <span className="text-xs text-muted-foreground">Rank #{bid.rank}</span>
                    </div>
                    <div className="text-right text-xs">
                      <div className="flex items-center space-x-2">
                        <span>${bid.bidPrice}</span>
                        <span>•</span>
                        <span>{bid.eta}min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {optimalMix && (
              <div>
                <h4 className="text-sm font-medium mb-2">Optimal Resource Mix</h4>
                <Alert>
                  <Target className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    <strong>Selected:</strong> {optimalMix}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {socialWelfareScore.optimal > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Social Welfare Analysis</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-2 bg-green-500/20 rounded">
                    <div className="text-green-400 font-bold">${socialWelfareScore.optimal}</div>
                    <div className="text-xs">Optimal Cost</div>
                  </div>
                  <div className="text-center p-2 bg-red-500/20 rounded">
                    <div className="text-red-400 font-bold">${socialWelfareScore.alternative}</div>
                    <div className="text-xs">Alternative Cost</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  Savings: ${socialWelfareScore.alternative - socialWelfareScore.optimal} (23% improvement)
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Layer 3: Verification & Secure Communications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Layer 3: Verifier Agent ↔ Secure Comms Agent</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <p className="text-sm font-medium">Verifier Agent</p>
                </div>
                <div className="space-y-1 text-xs">
                  <p>• Conflict matrix: No conflicts</p>
                  <p>• Resource validation: PASSED</p>
                  <p>• Unit availability: VERIFIED</p>
                  <p>• Route optimization: OPTIMAL</p>
                  <p>• Safety protocols: APPROVED</p>
                </div>
              </div>
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
                  <p className="text-sm font-medium">Secure Comms Agent</p>
                </div>
                <div className="space-y-1 text-xs">
                  <p>• Encrypted channels: ACTIVE</p>
                  <p>• Inter-agency comms: ESTABLISHED</p>
                  <p>• Hospital APIs: CONNECTED</p>
                  <p>• CAD integration: SECURE</p>
                  <p>• Audit logging: ENABLED</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Verification Status</h4>
              <Alert className={
                verificationGate.status === 'passed' ? 'border-green-500/30 bg-green-500/10' :
                verificationGate.status === 'failed' ? 'border-red-500/30 bg-red-500/10' :
                'border-yellow-500/30 bg-yellow-500/10'
              }>
                <div className={`w-4 h-4 rounded-full ${
                  verificationGate.status === 'passed' ? 'bg-green-500' :
                  verificationGate.status === 'failed' ? 'bg-red-500' :
                  'bg-yellow-500 animate-pulse'
                }`}></div>
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {verificationGate.status === 'passed' ? 'VERIFICATION PASSED' :
                       verificationGate.status === 'failed' ? 'LOGIC CONFLICT' :
                       'VERIFYING...'}
                    </span>
                    <Badge variant={verificationGate.status === 'passed' ? 'default' : 'destructive'}>
                      {verificationGate.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm mt-1">{verificationGate.message}</p>
                  {verificationGate.conflictReason && (
                    <p className="text-sm text-red-400 mt-1">
                      <strong>Conflict:</strong> {verificationGate.conflictReason}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Security Checkpoints</h4>
              <div className="space-y-1">
                {[
                  { label: 'Protocol Compliance', status: 'passed' },
                  { label: 'Budget Authorization', status: 'passed' },
                  { label: 'Safety Validation', status: 'passed' },
                  { label: 'Resource Availability', status: 'passed' }
                ].map((check, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{check.label}</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor('complete')}`}></div>
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layer 4: Final Execution & Coordination */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="w-5 h-5" />
              <span>Layer 4: Coordinated Multi-Agency Dispatch</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 mb-4">
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                  <p className="text-sm font-medium">Multi-Agency Dispatch Status</p>
                </div>
                <div className="space-y-1 text-xs">
                  <p>• Fire dispatch: Engine-7 & Ladder-3 NOTIFIED</p>
                  <p>• Police dispatch: Alpha unit RESPONDING</p>
                  <p>• EMS dispatch: EMS-15 primary DISPATCHED</p>
                  <p>• Hospital coordination: SFGH trauma READY</p>
                  <p>• Command structure: UNIFIED</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Dispatch Command</h4>
              {dispatchSent ? (
                <Alert className="border-green-500/30 bg-green-500/10">
                  <Send className="w-4 h-4 text-green-400" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-400">FINAL DISPATCH COMMAND SENT</span>
                      <Badge className="bg-green-500/20 text-green-400">EXECUTED</Badge>
                    </div>
                    <p className="text-sm mt-1">
                      All units notified via secure AgentMail protocol
                    </p>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-yellow-500/30 bg-yellow-500/10">
                  <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <AlertDescription>
                    <span className="font-medium text-yellow-400">PREPARING DISPATCH...</span>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Audit Trail</h4>
              {auditLogId ? (
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Immutable Audit Log</p>
                      <p className="text-xs text-muted-foreground">
                        Record ID: {auditLogId}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Log
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
                  Audit log will be generated upon execution
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Performance Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 bg-blue-500/20 rounded">
                  <div className="font-bold text-blue-400">{processingTime.toFixed(1)}s</div>
                  <div>Total Time</div>
                </div>
                <div className="text-center p-2 bg-green-500/20 rounded">
                  <div className="font-bold text-green-400">8/8</div>
                  <div>Agents Active</div>
                </div>
                <div className="text-center p-2 bg-purple-500/20 rounded">
                  <div className="font-bold text-purple-400">96%</div>
                  <div>Avg Confidence</div>
                </div>
                <div className="text-center p-2 bg-yellow-500/20 rounded">
                  <div className="font-bold text-yellow-400">$860</div>
                  <div>Social Cost</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inter-Agent Communication Network */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Real-Time Inter-Agent Communications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Unit Agent Coordination</h4>
              <div className="space-y-1 text-xs">
                <div className="p-2 bg-red-500/10 rounded">
                  <p className="font-medium">Fire Unit → EMS Unit</p>
                  <p>"Structural fire confirmed, multiple victims, EMS needed for triage"</p>
                </div>
                <div className="p-2 bg-yellow-500/10 rounded">
                  <p className="font-medium">Police Unit → Fire Unit</p>
                  <p>"Perimeter secured, traffic diverted, safe access established"</p>
                </div>
                <div className="p-2 bg-green-500/10 rounded">
                  <p className="font-medium">EMS Unit → Secure Comms</p>
                  <p>"SFGH trauma ready, transport route optimized, 8.3min ETA"</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Routing Calculations</h4>
              <div className="space-y-1 text-xs">
                <div className="p-2 bg-blue-500/10 rounded">
                  <p className="font-medium">Routing Agent Analysis</p>
                  <p>• A* pathfinding: 3.2s compute time</p>
                  <p>• Traffic factor: 1.23x delay</p>
                  <p>• Alternative routes: 4 analyzed</p>
                  <p>• Optimal efficiency: 94.2%</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Social Welfare Optimization</h4>
              <div className="space-y-1 text-xs">
                <div className="p-2 bg-yellow-500/10 rounded">
                  <p className="font-medium">EMS Unit Calculations</p>
                  <p>• Base cost: $640</p>
                  <p>• Penalty function: -$234</p>
                  <p>• Strategic reserve cost: +$87</p>
                  <p>• Final welfare score: 0.847</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Secure Communications</h4>
              <div className="space-y-1 text-xs">
                <div className="p-2 bg-cyan-500/10 rounded">
                  <p className="font-medium">Secure Comms Agent</p>
                  <p>• Encrypted channels: All units connected</p>
                  <p>• Hospital API security: TLS 1.3</p>
                  <p>• Inter-agency protocols: Active</p>
                  <p>• Audit trail: Complete</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Current Agent Processing Flow</h4>
            <div className="flex items-center space-x-2 text-xs mb-2">
              <span className="px-2 py-1 bg-green-500/20 rounded">Intake</span>
              <span>→</span>
              <span className="px-2 py-1 bg-purple-500/20 rounded">LLM Fact</span>
              <span>→</span>
              <span className="px-2 py-1 bg-blue-500/20 rounded animate-pulse">Routing</span>
              <span>→</span>
              <span className="px-2 py-1 bg-cyan-500/20 rounded">Secure Comms</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="px-2 py-1 bg-red-500/20 rounded">Fire Unit</span>
              <span>+</span>
              <span className="px-2 py-1 bg-yellow-500/20 rounded">Police Unit</span>
              <span>+</span>
              <span className="px-2 py-1 bg-green-500/20 rounded">EMS Unit</span>
              <span>→</span>
              <span className="px-2 py-1 bg-orange-500/20 rounded">Verifier</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span>Fire ↔ Police ↔ EMS ↔ Secure Comms (continuous coordination)</span>
              <Badge variant="outline" className="text-xs">8-Agent Pipeline</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}