import { Vote, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Vote size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold gradient-text">VoteSmart</span>
          </div>
          <p className="text-xs text-surface-100/40 text-center max-w-md">
            ⚠️ <strong>Disclaimer:</strong> This app is for educational purposes only. 
            It does not represent any real political party, candidate, or election outcome.
          </p>
          <p className="text-xs text-surface-100/30 flex items-center gap-1">
            Made with <Heart size={12} className="text-red-400" /> for democracy
          </p>
        </div>
      </div>
    </footer>
  );
}
