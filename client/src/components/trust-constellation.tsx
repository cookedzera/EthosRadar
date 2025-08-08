import { useEffect, useRef, useState, memo } from "react";
import { Star, Users, Zap, Award, Crown, Shield, AlertTriangle, Brain, Network } from "lucide-react";

interface ConstellationNode {
  id: string;
  x: number;
  y: number;
  radius: number;
  brightness: number;
  color: string;
  user: {
    userkey: string;
    displayName: string;
    username: string;
    avatarUrl: string;
    score: number;
    tier: string;
  };
  connections: string[];
  isMainUser: boolean;
  pulse: number;
  riskLevel?: 'low' | 'moderate' | 'high' | 'critical';
  mutualConnections: number;
  trustIndex: number;
}

interface ConstellationConnection {
  from: string;
  to: string;
  strength: number;
  amount: number;
  type: 'vouch' | 'review' | 'mutual';
  color: string;
  animated: boolean;
  bidirectional?: boolean;
  riskScore?: number;
}

interface TrustConstellationProps {
  user: any;
  vouchData?: any;
  realStats?: any;
  r4rData?: any;
  className?: string;
}

const getTierInfo = (score: number) => {
  if (score >= 2000) return { 
    icon: Crown, 
    tier: 'Exemplary',
    color: '#8b5cf6',
    brightness: 1.0
  };
  if (score >= 1600) return { 
    icon: Award, 
    tier: 'Reputable',
    color: '#10b981',
    brightness: 0.85
  };
  if (score >= 1200) return { 
    icon: Zap, 
    tier: 'Neutral',
    color: '#3b82f6',
    brightness: 0.7
  };
  if (score >= 800) return { 
    icon: AlertTriangle, 
    tier: 'Questionable',
    color: '#f59e0b',
    brightness: 0.5
  };
  return { 
    icon: Shield, 
    tier: 'Untrusted',
    color: '#6b7280',
    brightness: 0.3
  };
};

export const TrustConstellation = memo(({ user, vouchData, realStats, r4rData, className = "" }: TrustConstellationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<ConstellationNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<ConstellationNode | null>(null);
  const [nodes, setNodes] = useState<ConstellationNode[]>([]);
  const [connections, setConnections] = useState<ConstellationConnection[]>([]);
  const [networkInsights, setNetworkInsights] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const animationRef = useRef<number>();

  // Enhanced constellation generation with AI analysis
  useEffect(() => {
    if (!user || !vouchData || !vouchData.success || !vouchData.data) return;
    
    generateEnhancedConstellation();
  }, [user, vouchData, realStats, r4rData]);

  const generateEnhancedConstellation = async () => {
    setIsAnalyzing(true);

    try {
      const newNodes: ConstellationNode[] = [];
      const newConnections: ConstellationConnection[] = [];
      const centerX = 150;
      const centerY = 150;

      // Enhanced main user node with actual user data
      const mainUserTier = getTierInfo(user.score || 0);
      const userRisk = r4rData?.riskLevel?.toLowerCase() || 'low';
      
      const mainNode: ConstellationNode = {
        id: user.userkeys?.[0] || 'main',
        x: centerX,
        y: centerY,
        radius: 12,
        brightness: mainUserTier.brightness,
        color: mainUserTier.color,
        user: {
          userkey: user.userkeys?.[0] || '',
          displayName: user.displayName || user.username || 'User',
          username: user.username || '',
          avatarUrl: user.avatarUrl || '',
          score: user.score || 0,
          tier: mainUserTier.tier
        },
        connections: [],
        isMainUser: true,
        pulse: 0,
        riskLevel: userRisk,
        mutualConnections: 0,
        trustIndex: user.score || 0
      };
      newNodes.push(mainNode);

      // Process REAL vouch data - only if we have actual connections
      if (!vouchData.data.received?.length && !vouchData.data.given?.length) {
        console.log('🌌 No vouch connections found for constellation');
        setNetworkInsights({
          totalNodes: 1,
          mutualConnections: 0,
          riskConnections: 0,
          trustIndex: user.score || 0,
          networkHealth: 'isolated'
        });
        setNodes(newNodes);
        setConnections(newConnections);
        setIsAnalyzing(false);
        return;
      }

      // Build authentic connection map from real vouch data
      const connectedUsers = new Map<string, any>();
      const mutualConnections = new Set<string>();
      
      // Process received vouches (people who vouched FOR this user)
      const receivedVouches = vouchData.data.received || [];
      receivedVouches.forEach((vouch: any) => {
        if (vouch.voucherInfo?.userkey && vouch.voucherInfo.displayName) {
          const userkey = vouch.voucherInfo.userkey;
          connectedUsers.set(userkey, {
            ...vouch.voucherInfo,
            vouchAmount: parseFloat(vouch.amountEth || vouch.amount || '0'),
            relationship: 'received',
            vouchTimestamp: vouch.createdAt,
            displayName: vouch.voucherInfo.displayName || vouch.voucherInfo.username || 'Unknown',
            trustScore: vouch.voucherInfo.score || 1200
          });
        }
      });

      // Process given vouches (people this user vouched FOR) and detect mutual relationships
      const givenVouches = vouchData.data.given || [];
      givenVouches.forEach((vouch: any) => {
        if (vouch.voucheeInfo?.userkey && vouch.voucheeInfo.displayName) {
          const userkey = vouch.voucheeInfo.userkey;
          const existing = connectedUsers.get(userkey);
          
          if (existing) {
            // This is a MUTUAL connection - both vouched for each other
            existing.relationship = 'mutual';
            existing.vouchAmount += parseFloat(vouch.amountEth || vouch.amount || '0');
            mutualConnections.add(userkey);
          } else {
            // One-way vouch (this user vouched for them)
            connectedUsers.set(userkey, {
              ...vouch.voucheeInfo,
              vouchAmount: parseFloat(vouch.amountEth || vouch.amount || '0'),
              relationship: 'given',
              vouchTimestamp: vouch.createdAt,
              displayName: vouch.voucheeInfo.displayName || vouch.voucheeInfo.username || 'Unknown',
              trustScore: vouch.voucheeInfo.score || 1200
            });
          }
        }
      });

      console.log(`🔗 Found ${connectedUsers.size} total connections, ${mutualConnections.size} mutual`);

      // Add R4R risk scores if available
      const riskMap = new Map<string, number>();
      if (r4rData?.networkConnections) {
        r4rData.networkConnections.forEach((connection: any) => {
          if (connection.userkey && typeof connection.suspiciousScore === 'number') {
            riskMap.set(connection.userkey, connection.suspiciousScore);
          }
        });
      }

      if (connectedUsers.size === 0) {
        console.log('🌌 No connections processed for constellation');
        setNetworkInsights({
          totalNodes: 1,
          mutualConnections: 0,
          riskConnections: 0,
          trustIndex: user.score || 0,
          networkHealth: 'isolated'
        });
        setNodes(newNodes);
        setConnections(newConnections);
        setIsAnalyzing(false);
        return;
      }

      // Sort connections by importance: mutual first, then by trust score and vouch amount
      const userArray = Array.from(connectedUsers.values());
      const sortedUsers = userArray.sort((a, b) => {
        // Priority 1: Mutual connections first
        if (a.relationship === 'mutual' && b.relationship !== 'mutual') return -1;
        if (b.relationship === 'mutual' && a.relationship !== 'mutual') return 1;
        
        // Priority 2: Higher trust score
        const scoreDiff = (b.trustScore || 0) - (a.trustScore || 0);
        if (Math.abs(scoreDiff) > 50) return scoreDiff;
        
        // Priority 3: Higher vouch amount
        return (b.vouchAmount || 0) - (a.vouchAmount || 0);
      });

      // Show significant connections (limit to prevent clutter)
      const maxConnections = Math.min(sortedUsers.length, 10);
      const topConnections = sortedUsers.slice(0, maxConnections);
    
      if (topConnections.length === 0) {
        // User has no vouch connections
        setNetworkInsights({
          totalNodes: 1,
          mutualConnections: 0,
          riskConnections: 0,
          trustIndex: user.score || 0,
          networkHealth: 'isolated'
        });
      } else {
        let riskCount = 0;
        
        // Create nodes for real connections with safe validation
        topConnections.forEach((connectedUser, index) => {
          try {
            if (!connectedUser || !connectedUser.userkey || !connectedUser.displayName) {
              console.warn('Invalid connection data, skipping:', connectedUser);
              return;
            }

            const angle = (2 * Math.PI * index) / topConnections.length;
            const tier = getTierInfo(connectedUser.trustScore || 1200);
            
            // Dynamic positioning - mutual connections closer, higher trust scores closer
            let baseDistance = 70;
            if (connectedUser.relationship === 'mutual') {
              baseDistance = 55; // Closer for mutual connections
            } else if (connectedUser.trustScore > 1800) {
              baseDistance = 60; // Closer for high trust
            } else if (connectedUser.trustScore < 1000) {
              baseDistance = 85; // Further for low trust
            }
            
            // Apply risk factor if available
            const riskScore = riskMap.get(connectedUser.userkey) || 0;
            let nodeColor = tier.color;
            let nodeRadius = connectedUser.relationship === 'mutual' ? 8 : 6;
            
            if (riskScore > 70) {
              nodeColor = '#ef4444'; // High risk - red
              riskCount++;
            } else if (riskScore > 40) {
              nodeColor = '#f59e0b'; // Moderate risk - orange
            }
            
            // Add slight randomness to prevent perfect overlap
            const offsetAngle = angle + (Math.random() - 0.5) * 0.2;
            const offsetDistance = baseDistance + (Math.random() - 0.5) * 8;
          
            const node: ConstellationNode = {
              id: connectedUser.userkey,
              x: centerX + Math.cos(offsetAngle) * offsetDistance,
              y: centerY + Math.sin(offsetAngle) * offsetDistance,
              radius: nodeRadius,
              brightness: tier.brightness,
              color: nodeColor,
              user: {
                userkey: connectedUser.userkey,
                displayName: connectedUser.displayName,
                username: connectedUser.username || '',
                avatarUrl: connectedUser.avatarUrl || '',
                score: connectedUser.trustScore || 1200,
                tier: tier.tier
              },
              connections: [mainNode.id],
              isMainUser: false,
              pulse: Math.random() * Math.PI * 2,
              riskLevel: riskScore > 70 ? 'high' : riskScore > 40 ? 'moderate' : 'low',
              mutualConnections: connectedUser.relationship === 'mutual' ? 1 : 0,
              trustIndex: connectedUser.trustScore || 1200
            };
            
            newNodes.push(node);
            
            // Create connection line
            const connection: ConstellationConnection = {
              from: mainNode.id,
              to: node.id,
              strength: connectedUser.relationship === 'mutual' ? 0.8 : 0.5,
              amount: connectedUser.vouchAmount || 0,
              type: connectedUser.relationship === 'mutual' ? 'mutual' : connectedUser.relationship || 'vouch',
              color: nodeColor,
              animated: connectedUser.relationship === 'mutual',
              bidirectional: connectedUser.relationship === 'mutual',
              riskScore: riskScore
            };
            
            newConnections.push(connection);
            mainNode.connections.push(node.id);
          } catch (nodeError) {
            console.warn('Error creating node for connection:', connectedUser, nodeError);
          }
        });
        
        // Calculate actual network metrics
        const mutualCount = mutualConnections.size;
        mainNode.mutualConnections = mutualCount;
        
        const networkHealth = riskCount > topConnections.length * 0.5 ? 'risky' :
                             mutualCount > 2 ? 'healthy' : 'developing';
        
        setNetworkInsights({
          totalNodes: topConnections.length + 1,
          mutualConnections: mutualCount,
          riskConnections: riskCount,
          trustIndex: user.score || 0,
          networkHealth
        });
      }

      setNodes(newNodes);
      setConnections(newConnections);
      
    } catch (error) {
      console.error('Failed to generate constellation:', error);
      setNetworkInsights({
        totalNodes: 1,
        mutualConnections: 0,
        riskConnections: 0,
        trustIndex: user.score || 0,
        networkHealth: 'error'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const animate = () => {
      time += 0.02;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw light background to match theme
      ctx.fillStyle = 'rgba(249, 250, 251, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections with light theme styling
      connections.forEach(conn => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        
        if (fromNode && toNode) {
          ctx.strokeStyle = conn.animated ? conn.color + '80' : conn.color + '60';
          ctx.lineWidth = conn.animated ? 2 : 1;
          
          if (conn.animated) {
            // Animated dashed line for mutual vouches
            const dashOffset = time * 15;
            ctx.setLineDash([4, 4]);
            ctx.lineDashOffset = dashOffset;
          } else {
            ctx.setLineDash([2, 3]);
          }
          
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.stroke();
        }
      });

      // Draw nodes
      nodes.forEach(node => {
        const pulseScale = node.isMainUser ? 
          1 + Math.sin(time * 3) * 0.1 : 
          1 + Math.sin(time * 2 + node.pulse) * 0.05;
        
        const radius = node.radius * pulseScale;
        
        // Subtle outer glow for light theme
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, radius * 1.5
        );
        gradient.addColorStop(0, node.color + '40');
        gradient.addColorStop(1, node.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Main star with border for light theme
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // White border for contrast
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Subtle center highlight
        ctx.fillStyle = '#ffffff80';
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight main user with ring
        if (node.isMainUser) {
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);
          ctx.stroke();
          
          // Inner white ring
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, connections]);

  // Handle mouse interactions
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const hoveredNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= node.radius + 5;
    });

    setHoveredNode(hoveredNode || null);
    canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= node.radius + 5;
    });

    setSelectedNode(clickedNode || null);
  };

  const stats = {
    totalShown: nodes.length - 1,
    mutualConnections: networkInsights?.mutualConnections || 0,
    totalNetwork: vouchData?.success && vouchData.data ? 
      (vouchData.data.received?.length || 0) + (vouchData.data.given?.length || 0) : 0,
    riskConnections: networkInsights?.riskConnections || 0,
    trustIndex: networkInsights?.trustIndex || (user.score || 0),
    networkHealth: networkInsights?.networkHealth || 'unknown'
  };

  return (
    <div className={`bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-gray-200/50 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <Network className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Trust Constellation</h3>
            <p className="text-xs text-gray-600">AI-Enhanced Network Analysis</p>
          </div>
        </div>
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Brain className="w-4 h-4 animate-pulse" />
            <span>Analyzing...</span>
          </div>
        )}
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="w-full h-auto bg-gray-50/80 rounded-2xl border border-gray-200/50"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          data-testid="constellation-canvas"
        />
        
        {/* Enhanced hover tooltip */}
        {hoveredNode && !hoveredNode.isMainUser && (
          <div className="absolute top-2 left-2 bg-white/95 text-gray-800 text-xs p-3 rounded-xl border border-gray-200 shadow-lg pointer-events-none backdrop-blur-sm min-w-[180px]">
            <div className="font-bold text-gray-900">{hoveredNode.user.displayName}</div>
            <div className="text-gray-600">Trust Score: {hoveredNode.user.score}</div>
            <div className="text-gray-600">Tier: {hoveredNode.user.tier}</div>
            <div className="flex items-center gap-1 mt-1">
              <div className={`w-2 h-2 rounded-full ${
                hoveredNode.riskLevel === 'high' ? 'bg-red-500' :
                hoveredNode.riskLevel === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <span className="text-gray-600 capitalize">{hoveredNode.riskLevel} Risk</span>
            </div>
            {hoveredNode.mutualConnections > 0 && (
              <div className="text-blue-600 text-xs mt-1">✓ Mutual Connection</div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Stats with Network Health */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{stats.totalShown}</div>
          <div className="text-xs text-gray-600">Top Shown</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{stats.mutualConnections}</div>
          <div className="text-xs text-gray-600">Mutual</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-emerald-600">{stats.totalNetwork}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
      </div>

      {/* Network Health Indicator */}
      {networkInsights && (
        <div className="mt-4 p-3 bg-gray-50/80 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                stats.networkHealth === 'healthy' ? 'bg-green-500' :
                stats.networkHealth === 'risky' ? 'bg-red-500' :
                stats.networkHealth === 'developing' ? 'bg-yellow-500' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium text-gray-700 capitalize">
                {stats.networkHealth} Network
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Trust Index: {Math.round(stats.trustIndex)}
            </div>
          </div>
          {stats.riskConnections > 0 && (
            <div className="text-xs text-red-600 mt-1">
              ⚠️ {stats.riskConnections} high-risk connection{stats.riskConnections > 1 ? 's' : ''} detected
            </div>
          )}
        </div>
      )}

      {/* Enhanced Legend */}
      <div className="mt-4 space-y-2">
        <div className="text-xs text-gray-600 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Exemplary</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Reputable</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Neutral</span>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500 text-center border-t border-gray-200 pt-2">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-1 h-3 bg-green-500"></div>
              <span>Low Risk</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-3 bg-yellow-500"></div>
              <span>Moderate Risk</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-3 bg-red-500"></div>
              <span>High Risk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

TrustConstellation.displayName = 'TrustConstellation';