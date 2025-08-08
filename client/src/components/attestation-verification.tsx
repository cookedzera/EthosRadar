import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAttestations } from '@/hooks/use-attestations';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw,
  Wallet,
  Hash,
  Clock
} from 'lucide-react';
import { SiX, SiDiscord, SiFarcaster, SiTelegram, SiEthereum } from 'react-icons/si';
import { formatDistanceToNow } from 'date-fns';

interface AttestationVerificationProps {
  user: any;
  userkey: string;
}

interface ConnectedAccount {
  id: string;
  type: 'social' | 'wallet' | 'attestation';
  platform: string;
  handle: string;
  verified: boolean;
  confidence: number;
  createdAt?: string;
  lastChecked: string;
  details?: {
    verification_badge?: boolean;
    activity_score?: number;
    account_active?: boolean;
    address?: string;
    fid?: number;
    attestation_id?: string;
    service?: string;
    hash?: string;
  };
}

export function AttestationVerification({ user, userkey }: AttestationVerificationProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: attestationData, refetch, isLoading } = useAttestations(userkey);

  const connectedAccounts: ConnectedAccount[] = attestationData?.data?.connectedAccounts || [];
  const summary = attestationData?.data?.summary || { total: 0, verified: 0, platforms: [], avgConfidence: 0 };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter/x':
      case 'twitter':
      case 'x':
        return <SiX className="h-4 w-4" />;
      case 'farcaster':
        return <SiFarcaster className="h-4 w-4" />;
      case 'ethereum':
        return <SiEthereum className="h-4 w-4" />;
      case 'discord':
        return <SiDiscord className="h-4 w-4" />;
      case 'telegram':
        return <SiTelegram className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wallet':
        return <Wallet className="h-4 w-4" />;
      case 'attestation':
        return <Hash className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-blue-600" />
            Identity Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-blue-600" />
            Identity Verification
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {summary.total} connected account{summary.total !== 1 ? 's' : ''} • {summary.verified} verified • {summary.avgConfidence}% avg confidence
        </div>
      </CardHeader>
      <CardContent>
        {connectedAccounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No connected accounts found</p>
            <p className="text-xs">User may have limited profile visibility</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connectedAccounts.map((account) => (
              <div 
                key={account.id} 
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center border rounded-full bg-white">
                  {account.type === 'social' ? getPlatformIcon(account.platform) : getTypeIcon(account.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{account.platform}</h4>
                    {account.verified && (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {account.handle}
                  </p>
                  {account.details?.address && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {account.details.address}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Badge className={`text-xs ${getConfidenceColor(account.confidence)}`}>
                    {account.confidence}%
                  </Badge>
                  {account.details?.account_active !== undefined && (
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${account.details.account_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-xs text-muted-foreground">
                        {account.details.account_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Statistics */}
        {connectedAccounts.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Verification Summary
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {summary.platforms.length}
                </div>
                <div className="text-xs text-muted-foreground">Platforms</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {Math.round((summary.verified / summary.total) * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Verified</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {connectedAccounts.filter(a => a.type === 'attestation').length}
                </div>
                <div className="text-xs text-muted-foreground">Attestations</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}