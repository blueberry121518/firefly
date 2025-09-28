import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { FireflyLogo } from './FireflyLogo';
import { 
  Shield, 
  Brain, 
  Clock, 
  Users, 
  Zap, 
  Activity, 
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Radio,
  Map,
  Gavel,
  Database,
  TrendingUp
} from 'lucide-react';

interface FireflyLandingProps {
  onEnterDemo: () => void;
}

export function FireflyLanding({ onEnterDemo }: FireflyLandingProps) {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Dispatch",
      description: "An advanced conversational AI, powered by Google Gemini, handles 911 calls with unparalleled accuracy, instantly structuring incident data for the agent network."
    },
    {
      icon: <Gavel className="w-6 h-6" />,
      title: "Intelligent Agent Auctions",
      description: "Instead of human guesswork, FireFly uses a decentralized marketplace where unit-agents bid on incidents. These agents analyze real-time traffic data and strategic incident history to guarantee the optimal allocation of resources."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "60-Second Compliance", 
      description: "Our entire agent-driven pipeline, from call intake to dispatch, averages 47.2 seconds—beating the national 60-second safety standard and giving first responders a critical head start."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Self-Improving",
      description: "Every action is recorded on a decentralized ledger for a transparent audit trail. After the incident, an Evaluator Agent analyzes the outcome to ensure the entire system learns and improves for the future."
    }
  ];

  const metrics = [
    { label: "A Decentralized Response Team", value: "7 Agents", target: "Specialized AI Network", status: "good" },
    { label: "Seconds Save Lives", value: "< 3.2s", target: "Eliminates Deadly Delays", status: "good" },
    { label: "Clarity in Chaos", value: "97.8%", target: "Perfect Under Stress", status: "good" },
    { label: "The Smartest Response, Every Time", value: "847", target: "Live Data + History", status: "active" }
  ];

  const agents = [
    { name: "Conversational Intake Agent", icon: <Radio className="w-4 h-4" />, color: "blue", description: "Ephemeral AEA for voice processing" },
    { name: "Routing Master Agent", icon: <Gavel className="w-4 h-4" />, color: "purple", description: "Market orchestrator for auctions" },
    { name: "Unit Swarm Agents", icon: <Users className="w-4 h-4" />, color: "red", description: "Digital twins of emergency units" },
    { name: "Hospital Network Agents", icon: <Database className="w-4 h-4" />, color: "green", description: "Capacity and specialty providers" },
    { name: "Secure Comms Agent", icon: <Shield className="w-4 h-4" />, color: "orange", description: "Immutable ledger service" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-red-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* Header */}
      <div className="relative z-10 pt-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FireflyLogo size="lg" />
              <div>
                <h1 className="text-2xl font-semibold text-[rgba(255,255,255,1)]">FireFly</h1>
                <p className="text-sm text-muted-foreground">Agentic Network for Emergency Response Optimization</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-500/10 border-green-500/20 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              System Online
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-20 pb-16">
        <div className="container mx-auto px-6 text-center">
          <Badge variant="outline" className="mb-6 bg-blue-500/10 border-blue-500/20 text-blue-400">
            <Brain className="w-3 h-3 mr-2" />
            Powered by Fetch.ai Agent Economy
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
            The Future of 911 is
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
              Autonomous
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            FireFly is a decentralized network of autonomous Fetch.ai agents that intelligently coordinates emergency response, 
            transforming dispatch from a manual process into a self-optimizing, continuously learning, life-saving ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              onClick={onEnterDemo}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg h-auto"
            >
              <Activity className="w-5 h-5 mr-3" />
              Launch Live Demo
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
          </div>

          {/* Live Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {metrics.map((metric, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
                  <div className="text-sm text-muted-foreground mb-2">{metric.label}</div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs h-5 ${
                      metric.status === 'good' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                      metric.status === 'active' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                      'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {metric.status === 'good' ? <CheckCircle className="w-3 h-3 mr-1" /> : 
                     metric.status === 'active' ? <Activity className="w-3 h-3 mr-1" /> : 
                     <AlertTriangle className="w-3 h-3 mr-1" />}
                    {metric.target}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-[rgba(255,255,255,1)]">Powered by a Fetch.ai Agent Economy</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Seven specialized autonomous agents collaborate on the Fetch.ai network, creating a decentralized marketplace 
              where emergency units bid on incidents through real-time combinatorial auctions for optimal resource allocation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* The Agentic Pipeline */}
          <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2 text-[rgba(255,255,255,1)]">The Anatomy of an Autonomous Response Pipeline</h3>
              <p className="text-muted-foreground">FireFly's power comes from a seamless, autonomous pipeline. Each stage executes a critical task, and the 'Learn' phase ensures the system grows smarter with every incident, creating a workflow that is resilient, intelligent, and self-improving.</p>
            </div>

            {/* Agentic Network Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {agents.map((agent, index) => (
                <div key={index} className="bg-muted/30 rounded-lg p-4 border border-border/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full shrink-0 ${
                      agent.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                      agent.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                      agent.color === 'red' ? 'bg-red-500/20 text-red-400' :
                      agent.color === 'green' ? 'bg-green-500/20 text-green-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {agent.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[rgba(255,255,255,1)] mb-1">{agent.name}</h4>
                      <p className="text-xs text-muted-foreground">{agent.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Processing Pipeline Visualization */}
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 border-2 border-blue-500/40 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <Radio className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-sm font-medium text-blue-400">Intake</div>
                <div className="text-xs text-muted-foreground">Voice AI</div>
              </div>
              
              <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 mx-3 relative">
                <div className="absolute right-0 top-0 w-0 h-0 border-l-2 border-l-cyan-400 border-t border-b border-transparent transform -translate-y-1"></div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-cyan-500/20 border-2 border-cyan-500/40 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <Brain className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-sm font-medium text-cyan-400">Assessment</div>
                <div className="text-xs text-muted-foreground">AI Analysis</div>
              </div>
              
              <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 mx-3 relative">
                <div className="absolute right-0 top-0 w-0 h-0 border-l-2 border-l-purple-400 border-t border-b border-transparent transform -translate-y-1"></div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 border-2 border-purple-500/40 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <Gavel className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-sm font-medium text-purple-400">Auction</div>
                <div className="text-xs text-muted-foreground">Smart Bidding</div>
              </div>
              
              <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-400 to-red-400 mx-3 relative">
                <div className="absolute right-0 top-0 w-0 h-0 border-l-2 border-l-red-400 border-t border-b border-transparent transform -translate-y-1"></div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500/20 border-2 border-red-500/40 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <Users className="w-5 h-5 text-red-400" />
                </div>
                <div className="text-sm font-medium text-red-400">Deploy</div>
                <div className="text-xs text-muted-foreground">Unit Dispatch</div>
              </div>
              
              <div className="flex-1 h-0.5 bg-gradient-to-r from-red-400 to-green-400 mx-3 relative">
                <div className="absolute right-0 top-0 w-0 h-0 border-l-2 border-l-green-400 border-t border-b border-transparent transform -translate-y-1"></div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 border-2 border-green-500/40 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-sm font-medium text-green-400">Respond</div>
                <div className="text-xs text-muted-foreground">Emergency Aid</div>
              </div>
              
              <div className="flex-1 h-0.5 bg-gradient-to-r from-green-400 to-orange-400 mx-3 relative">
                <div className="absolute right-0 top-0 w-0 h-0 border-l-2 border-l-orange-400 border-t border-b border-transparent transform -translate-y-1"></div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500/20 border-2 border-orange-500/40 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-sm font-medium text-orange-400">Repeat</div>
                <div className="text-xs text-muted-foreground">Learn & Improve</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative z-10 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4 text-[rgba(255,255,255,1)]">Experience Autonomous Emergency Response</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Watch seven specialized Fetch.ai agents collaborate in real-time, conducting autonomous auctions, 
              optimizing resource allocation, and saving lives through decentralized intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={onEnterDemo}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-10 py-4 text-lg h-auto"
              >
                <Activity className="w-5 h-5 mr-3" />
                Launch Interactive Demo
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </div>
            
            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Live AI Conversations</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Real-time Map Tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Agent Flow Visualization</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-border/50 py-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FireflyLogo size="sm" />
              <div className="text-sm text-muted-foreground">
                © 2024 FireFly Emergency Response System
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Built for Public Safety</span>
              <Badge variant="outline" className="text-xs">
                NFPA Compliant
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}