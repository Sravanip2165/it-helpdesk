import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Search, Wifi, Monitor, Code2, KeyRound, Plug, Eye, ThumbsUp, Clock, ArrowLeft, Tag } from 'lucide-react';

const ARTICLES = [
  {
    id: 1, title: 'How to Connect to Company VPN', category: 'Network', icon: Wifi,
    desc: 'Step-by-step guide to setting up and connecting to the corporate VPN from home or remote locations.',
    views: 342, likes: 89, updated: 'Feb 20, 2026', code: 'KB-001',
    tags: ['VPN', 'Remote Work', 'Network'],
    content: `Step-by-step guide to setting up and connecting to the corporate VPN from home or remote locations.

1. Download the VPN client from the IT portal.
2. Install and launch the application.
3. Enter the server address: vpn.company.com
4. Use your corporate credentials to authenticate.
5. Select the appropriate connection profile.
6. Click Connect.

Troubleshooting:
- If connection times out, try flushing DNS (ipconfig /flushdns)
- Check if your firewall is blocking the VPN port (443)
- Ensure your internet connection is stable
- Try using a different network if on public Wi-Fi`,
  },
  {
    id: 2, title: 'Resolving Printer Connectivity Issues', category: 'Hardware', icon: Monitor,
    desc: 'Common fixes for printers showing offline or not responding to print jobs.',
    views: 256, likes: 72, updated: 'Feb 18, 2026', code: 'KB-002',
    tags: ['Printer', 'Hardware', 'Offline'],
    content: `Common fixes for printers showing offline or not responding to print jobs.

1. Check if the printer is powered on and connected to the network.
2. Restart the print spooler service (services.msc → Print Spooler → Restart).
3. Remove and re-add the printer from Control Panel.
4. Update or reinstall the printer driver from the manufacturer's website.
5. Check for paper jams or low ink/toner.
6. Ensure the printer IP address matches what's configured on your PC.

Troubleshooting:
- Run the Windows Printer Troubleshooter
- Check the printer queue for stuck jobs
- Verify the printer is set as the default printer
- Try printing a test page from the printer itself`,
  },
  {
    id: 3, title: 'Setting Up New Employee Workstation', category: 'Hardware', icon: Monitor,
    desc: 'Complete checklist for configuring a new employee laptop with all required software and access.',
    views: 189, likes: 55, updated: 'Feb 15, 2026', code: 'KB-003',
    tags: ['Onboarding', 'Hardware', 'Setup'],
    content: `Complete checklist for configuring a new employee laptop with all required software and access.

1. Unbox and power on the laptop.
2. Connect to the company network and join the domain.
3. Install Windows updates and restart.
4. Install required software: Office 365, VPN client, antivirus, Teams.
5. Configure company email in Outlook.
6. Enable BitLocker encryption.
7. Set up 2FA for all company accounts.
8. Map network drives using the IT guide.
9. Install department-specific software as per manager's request.
10. Test all applications and submit setup confirmation ticket.`,
  },
  {
    id: 4, title: 'Adobe Creative Cloud License Activation', category: 'Software', icon: Code2,
    desc: 'How to activate, transfer, and troubleshoot Adobe CC licenses for employees.',
    views: 167, likes: 48, updated: 'Feb 12, 2026', code: 'KB-004',
    tags: ['Adobe', 'Software', 'License'],
    content: `How to activate, transfer, and troubleshoot Adobe CC licenses for employees.

1. Go to creativecloud.adobe.com and sign in with your company email.
2. If prompted, select "Enterprise ID" as the account type.
3. Download and install the Creative Cloud desktop app.
4. Open the app and sign in to activate your license.
5. Install the specific Adobe apps you need.

Troubleshooting:
- If you see "License expired", sign out and back in to refresh
- Clear the OOBE folder if activation fails
- Contact IT if your license shows as not assigned`,
  },
  {
    id: 5, title: 'Network Switch Replacement Procedure', category: 'Network', icon: Plug,
    desc: 'Standard operating procedure for replacing failed network switches in office buildings.',
    views: 98, likes: 31, updated: 'Feb 10, 2026', code: 'KB-005',
    tags: ['Network', 'Switch', 'Hardware'],
    content: `Standard operating procedure for replacing failed network switches in office buildings.

Pre-Replacement Checklist:
1. Document all current port configurations and VLANs.
2. Notify affected users of planned downtime.
3. Order replacement switch of same model or compatible replacement.

Replacement Steps:
1. Power down the failed switch safely.
2. Label all cables before disconnecting.
3. Remove failed switch from rack.
4. Mount new switch and apply base configuration.
5. Re-connect all network cables in same port order.
6. Power on and verify all port lights are active.
7. Test connectivity from 3+ workstations.`,
  },
  {
    id: 6, title: 'Managing SharePoint Permissions', category: 'Access', icon: KeyRound,
    desc: 'Guide to granting, modifying, and revoking SharePoint folder and file permissions.',
    views: 134, likes: 40, updated: 'Feb 08, 2026', code: 'KB-006',
    tags: ['SharePoint', 'Access', 'Permissions'],
    content: `Guide to granting, modifying, and revoking SharePoint folder and file permissions.

Granting Access:
1. Navigate to the SharePoint site or document library.
2. Click the gear icon → Site Permissions.
3. Click "Invite people" or "Share".
4. Enter the user's email and select permission level.
5. Click Send to notify the user.

Best Practices:
- Use groups rather than individual permissions
- Review permissions quarterly
- Document all permission changes in the IT log`,
  },
  {
    id: 7, title: 'Outlook Email Configuration Guide', category: 'Software', icon: Code2,
    desc: 'Setting up Microsoft Outlook with company email, signatures, and shared mailboxes.',
    views: 221, likes: 63, updated: 'Feb 05, 2026', code: 'KB-007',
    tags: ['Outlook', 'Email', 'Software'],
    content: `Setting up Microsoft Outlook with company email, signatures, and shared mailboxes.

Initial Setup:
1. Open Outlook and click File → Add Account.
2. Enter your company email address and click Connect.
3. Sign in with your corporate credentials.
4. Wait for mailbox to sync (10-30 minutes for large mailboxes).

Adding an Email Signature:
1. Go to File → Options → Mail → Signatures.
2. Click New and name your signature.
3. Use the company signature template from the IT intranet.`,
  },
  {
    id: 8, title: 'Two-Factor Authentication Setup', category: 'Access', icon: KeyRound,
    desc: 'How to enable and configure 2FA for company accounts and applications.',
    views: 310, likes: 94, updated: 'Feb 03, 2026', code: 'KB-008',
    tags: ['2FA', 'Security', 'Access'],
    content: `How to enable and configure 2FA for company accounts and applications.

Setting Up Microsoft Authenticator:
1. Download "Microsoft Authenticator" from App Store or Google Play.
2. Go to myaccount.microsoft.com → Security Info → Add method.
3. Select "Authenticator app" and follow the prompts.
4. Scan the QR code with your phone.
5. Enter the verification code to confirm setup.

Backup Codes:
- Always save your backup codes in a secure location
- Contact IT immediately if you think your account is compromised`,
  },
  {
    id: 9, title: 'Wi-Fi Troubleshooting Guide', category: 'Network', icon: Wifi,
    desc: 'Diagnosing and resolving wireless connectivity issues in the office.',
    views: 178, likes: 52, updated: 'Jan 30, 2026', code: 'KB-009',
    tags: ['WiFi', 'Network', 'Connectivity'],
    content: `Diagnosing and resolving wireless connectivity issues in the office.

Basic Troubleshooting:
1. Turn Wi-Fi off and on again on your device.
2. Forget the network and reconnect.
3. Restart your device.
4. Check if other devices can connect to the same network.

Common Issues:
- Slow speed: Try connecting to 5GHz band
- Intermittent drops: Check for interference from other devices
- Can't connect: Verify you're using the correct password and SSID`,
  },
  {
    id: 10, title: 'Windows Update Management', category: 'Software', icon: Code2,
    desc: 'Best practices for managing Windows updates on company devices.',
    views: 143, likes: 38, updated: 'Jan 28, 2026', code: 'KB-010',
    tags: ['Windows', 'Updates', 'Software'],
    content: `Best practices for managing Windows updates on company devices.

Checking for Updates:
1. Go to Settings → Windows Update.
2. Click "Check for updates".
3. Install all available updates.
4. Restart when prompted.

Update Policy:
- Security updates: Install within 48 hours of release
- Feature updates: Coordinate with IT before installing`,
  },
];

const CATEGORIES = ['All', 'Network', 'Hardware', 'Software', 'Access'];

const CAT_STYLES = {
  Network:  { badge: 'bg-blue-50 text-blue-600 border-blue-200',    icon: 'bg-blue-50 text-blue-500'    },
  Hardware: { badge: 'bg-amber-50 text-amber-600 border-amber-200', icon: 'bg-amber-50 text-amber-500'  },
  Software: { badge: 'bg-purple-50 text-purple-600 border-purple-200', icon: 'bg-purple-50 text-purple-500' },
  Access:   { badge: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: 'bg-emerald-50 text-emerald-500' },
};

export default function KnowledgeBase() {
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = ARTICLES.filter((a) => {
    const matchSearch = !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.desc.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === 'All' || a.category === category;
    return matchSearch && matchCat;
  });

  if (selected) {
    const Icon = selected.icon;
    const catStyle = CAT_STYLES[selected.category] || { badge: 'bg-slate-100 text-slate-500 border-slate-200', icon: 'bg-slate-100 text-slate-500' };
    return (
      <Layout>
        <div className="mb-6">
          <button onClick={() => setSelected(null)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors">
            <ArrowLeft size={15} /> Back to Knowledge Base
          </button>
        </div>
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${catStyle.badge}`}>
              {selected.category}
            </span>
            <span className="text-xs font-semibold text-slate-400">{selected.code}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">{selected.title}</h1>
          <div className="flex items-center gap-4 text-xs text-slate-400 mb-5">
            <span className="flex items-center gap-1"><Clock size={12} /> Updated {selected.updated}</span>
            <span className="flex items-center gap-1"><Eye size={12} /> {selected.views} views</span>
            <span className="flex items-center gap-1"><ThumbsUp size={12} /> {selected.likes} found helpful</span>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {selected.content}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Tag size={14} className="text-slate-400" />
            {selected.tags.map((tag) => (
              <span key={tag} className="text-xs font-semibold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Knowledge Base</h2>
        <p className="text-sm text-slate-400 mt-0.5">Common solutions and troubleshooting guides</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5 items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search articles or tags..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
        </div>
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-0.5">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                category === cat ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 text-center">
          <Search size={32} className="text-slate-300 mb-3" />
          <p className="text-slate-600 font-semibold">No articles found</p>
          <p className="text-slate-400 text-sm mt-1">Try a different search term or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((article) => {
            const Icon = article.icon;
            const catStyle = CAT_STYLES[article.category] || { badge: 'bg-slate-100 text-slate-500 border-slate-200', icon: 'bg-slate-100 text-slate-500' };
            return (
              <div key={article.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                onClick={() => setSelected(article)}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${catStyle.icon}`}>
                    <Icon size={22} />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${catStyle.badge}`}>
                    {article.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{article.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">{article.desc}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Eye size={12} /> {article.views}</span>
                    <span className="flex items-center gap-1"><ThumbsUp size={12} /> {article.likes}</span>
                  </div>
                  <span className="text-sm font-semibold text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                    Read →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
