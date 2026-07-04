import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Activity, GraduationCap, Calculator, Percent, BrainCircuit, X, Plus, Trash2 } from 'lucide-react';

const OVERLAY_STYLE = {
  position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
};

const MODAL_STYLE = {
  background: '#FFFFFF', padding: '24px', maxWidth: '440px', width: '100%',
  maxHeight: '85vh', overflowY: 'auto'
};

// ── Modals ──────────────────────────────────────────────────────────

function Modal({ isOpen, onClose, title, icon: Icon, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={OVERLAY_STYLE} onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="brutal-card"
            style={MODAL_STYLE}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={20} color="#000000" /> {title}
              </h2>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#000000" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AttendancePlannerModal({ isOpen, onClose, stats }) {
  const [target, setTarget] = useState(75);
  
  const p = stats?.presentCount || 0;
  const w = stats?.totalWorkingDays || 0;

  const getRequired = (tgt) => {
    if (w === 0) return 0;
    const req = Math.ceil(((tgt / 100) * w - p) / (1 - tgt / 100));
    return req < 0 ? 0 : req;
  };

  const getMissable = (tgt) => {
    if (w === 0) return 0;
    const miss = Math.floor(p / (tgt / 100) - w);
    return miss < 0 ? 0 : miss;
  };

  const reqSessions = getRequired(target);
  const missable = getMissable(target);
  
  const miss1 = w === 0 ? 0 : (p / (w + 1)) * 100;
  const miss2 = w === 0 ? 0 : (p / (w + 2)) * 100;
  const attend5 = w === 0 ? 0 : ((p + 5) / (w + 5)) * 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Attendance Planner" icon={Target}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div className="brutal-card" style={{ padding: '12px', background: '#FEF3C7' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', margin: '0 0 4px', opacity: 0.7 }}>Present Days</p>
          <p style={{ fontSize: '24px', fontWeight: '900', margin: 0, fontFamily: 'var(--font-sketch)' }}>{p}</p>
        </div>
        <div className="brutal-card" style={{ padding: '12px', background: '#E0E7FF' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', margin: '0 0 4px', opacity: 0.7 }}>Working Days</p>
          <p style={{ fontSize: '24px', fontWeight: '900', margin: 0, fontFamily: 'var(--font-sketch)' }}>{w}</p>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 8px' }}>Target Percentage</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[75, 80, 85, 90].map(t => (
            <button
              key={t}
              onClick={() => setTarget(t)}
              className="brutal-btn"
              style={{ 
                flex: 1, padding: '8px 0', fontSize: '14px', 
                background: target === t ? 'var(--primary)' : '#FFFFFF' 
              }}
            >
              {t}%
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ padding: '12px', border: '2px solid #000', borderRadius: '8px', background: reqSessions > 0 ? '#FEE2E2' : '#E2FBE9' }}>
          <p style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 4px' }}>Sessions needed for {target}%</p>
          <p style={{ fontSize: '18px', fontWeight: '900', margin: 0, fontFamily: 'var(--font-sketch)' }}>
            {reqSessions > 0 ? `${reqSessions} consecutive sessions` : 'Target Achieved 🎉'}
          </p>
        </div>
        <div style={{ padding: '12px', border: '2px solid #000', borderRadius: '8px', background: missable > 0 ? '#E2FBE9' : '#FEE2E2' }}>
          <p style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 4px' }}>Sessions you can miss</p>
          <p style={{ fontSize: '18px', fontWeight: '900', margin: 0, fontFamily: 'var(--font-sketch)' }}>
            {missable > 0 ? `Up to ${missable} sessions` : 'None (0 buffer)'}
          </p>
        </div>
      </div>

      <div style={{ marginTop: '24px', borderTop: '2px dashed #000', paddingTop: '16px' }}>
        <p style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 12px' }}>What-if Scenarios</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', fontWeight: '600' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Missing 1 session:</span>
            <span style={{ fontWeight: '800', color: miss1 >= target ? '#0F5132' : '#842029' }}>{miss1.toFixed(2)}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Missing 2 sessions:</span>
            <span style={{ fontWeight: '800', color: miss2 >= target ? '#0F5132' : '#842029' }}>{miss2.toFixed(2)}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Attending next 5:</span>
            <span style={{ fontWeight: '800', color: '#0F5132' }}>{attend5.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Calculators ──────────────────────────────────────────────────────────

const GRADES = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'U': 0
};

function SGPAModal({ isOpen, onClose }) {
  const [subjects, setSubjects] = useState([{ id: 1, credits: 3, grade: 'A' }]);

  const addSub = () => setSubjects([...subjects, { id: Date.now(), credits: 3, grade: 'A' }]);
  const removeSub = (id) => setSubjects(subjects.filter(s => s.id !== id));
  
  const updateSub = (id, field, val) => setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: val } : s));

  const sgpa = useMemo(() => {
    let totalC = 0;
    let totalP = 0;
    subjects.forEach(s => {
      const c = Number(s.credits) || 0;
      totalC += c;
      totalP += c * (GRADES[s.grade] || 0);
    });
    return totalC === 0 ? 0 : totalP / totalC;
  }, [subjects]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="SGPA Calculator" icon={Calculator}>
      <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {subjects.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontWeight: '700', width: '20px' }}>{i+1}.</span>
            <input type="number" min="1" max="10" className="brutal-input" style={{ width: '80px', padding: '6px' }} value={s.credits} onChange={e => updateSub(s.id, 'credits', e.target.value)} placeholder="Cr" />
            <select className="brutal-input" style={{ flex: 1, padding: '6px' }} value={s.grade} onChange={e => updateSub(s.id, 'grade', e.target.value)}>
              {Object.keys(GRADES).map(g => <option key={g} value={g}>{g} ({GRADES[g]})</option>)}
            </select>
            <button onClick={() => removeSub(s.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={addSub} className="brutal-btn" style={{ width: '100%', marginTop: '12px', background: '#FFFFFF' }}>
        <Plus size={16} /> Add Subject
      </button>
      <div className="brutal-card" style={{ marginTop: '20px', padding: '16px', background: 'var(--primary)', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 4px' }}>Estimated SGPA</p>
        <p style={{ fontSize: '32px', fontWeight: '900', margin: 0, fontFamily: 'var(--font-sketch)' }}>{sgpa.toFixed(2)}</p>
      </div>
    </Modal>
  );
}

function CGPAModal({ isOpen, onClose }) {
  const [sems, setSems] = useState([{ id: 1, sgpa: 8.5 }]);

  const addSem = () => setSems([...sems, { id: Date.now(), sgpa: 8.0 }]);
  const removeSem = (id) => setSems(sems.filter(s => s.id !== id));
  const updateSem = (id, field, val) => setSems(sems.map(s => s.id === id ? { ...s, [field]: val } : s));

  const cgpa = useMemo(() => {
    let total = 0;
    sems.forEach(s => {
      total += Number(s.sgpa) || 0;
    });
    return sems.length === 0 ? 0 : total / sems.length;
  }, [sems]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CGPA Calculator" icon={GraduationCap}>
      <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sems.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontWeight: '700', width: '35px', fontSize: '11px' }}>Sem {i+1}</span>
            <input type="number" step="0.01" className="brutal-input" style={{ flex: 1, padding: '6px' }} value={s.sgpa} onChange={e => updateSem(s.id, 'sgpa', e.target.value)} placeholder="SGPA" />
            <button onClick={() => removeSem(s.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={addSem} className="brutal-btn" style={{ width: '100%', marginTop: '12px', background: '#FFFFFF' }}>
        <Plus size={16} /> Add Semester
      </button>
      <div className="brutal-card" style={{ marginTop: '20px', padding: '16px', background: 'var(--primary)', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 4px' }}>Estimated CGPA</p>
        <p style={{ fontSize: '32px', fontWeight: '900', margin: 0, fontFamily: 'var(--font-sketch)' }}>{cgpa.toFixed(2)}</p>
      </div>
    </Modal>
  );
}

function CGPAToPercentModal({ isOpen, onClose }) {
  const [val, setVal] = useState(8.5);
  const pct = Number(val) * 10;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CGPA to Percentage" icon={Percent}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Enter CGPA:</label>
        <input type="number" step="0.01" className="brutal-input" style={{ width: '100%', fontSize: '18px', padding: '12px' }} value={val} onChange={e => setVal(e.target.value)} />
      </div>
      <div className="brutal-card" style={{ padding: '16px', background: 'var(--primary)', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 4px' }}>Percentage</p>
        <p style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 8px', fontFamily: 'var(--font-sketch)' }}>{pct.toFixed(2)}%</p>
        <p style={{ fontSize: '10px', fontWeight: '700', opacity: 0.7, margin: 0 }}>Formula: CGPA × 10</p>
      </div>
    </Modal>
  );
}

function PercentToCGPAModal({ isOpen, onClose }) {
  const [val, setVal] = useState(85);
  const cgpa = Number(val) / 10;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Percentage to CGPA" icon={BrainCircuit}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Enter Percentage (%):</label>
        <input type="number" step="0.1" className="brutal-input" style={{ width: '100%', fontSize: '18px', padding: '12px' }} value={val} onChange={e => setVal(e.target.value)} />
      </div>
      <div className="brutal-card" style={{ padding: '16px', background: 'var(--primary)', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 4px' }}>CGPA</p>
        <p style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 8px', fontFamily: 'var(--font-sketch)' }}>{cgpa.toFixed(2)}</p>
        <p style={{ fontSize: '10px', fontWeight: '700', opacity: 0.7, margin: 0 }}>Formula: Percentage ÷ 10</p>
      </div>
    </Modal>
  );
}


// ── Main Toolkit Component ──────────────────────────────────────────────────────────

export default function StudentToolkit({ stats }) {
  const [activeModal, setActiveModal] = useState(null); // 'planner', 'sgpa', 'cgpa', 'c2p', 'p2c'

  const p = stats?.presentCount || 0;
  const w = stats?.totalWorkingDays || 0;
  const currentPct = w === 0 ? 0 : (p / w) * 100;
  
  // Quick predictions for the card
  const miss1 = w === 0 ? 0 : (p / (w + 1)) * 100;
  const attend1 = w === 0 ? 0 : ((p + 1) / (w + 1)) * 100;
  const missable75 = w === 0 ? 0 : Math.max(0, Math.floor(p / 0.75 - w));
  
  const bufferText = missable75 > 0 
    ? `You can miss ${missable75} more session${missable75 !== 1 ? 's' : ''}.` 
    : `You cannot miss any sessions right now.`;
    
  const getBadge = () => {
    if (currentPct >= 85) return { text: 'Safe', color: '#0F5132', dot: '#22C55E', bg: '#E2FBE9' };
    if (currentPct >= 75) return { text: 'Warning', color: '#854D0E', dot: '#EAB308', bg: '#FEF08A' };
    return { text: 'Critical', color: '#842029', dot: '#EF4444', bg: '#FEE2E2' };
  };
  const badge = getBadge();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* ── CARD 1: Attendance Predictor ── */}
      <div className="brutal-card" style={{ padding: '20px' }}>
        <p style={{ fontSize: '14px', fontWeight: '900', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-sketch)' }}>
          <Activity size={16} color="#000000" /> Attendance Predictor
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '700', margin: '0 0 2px', opacity: 0.7 }}>Current</p>
            <p style={{ fontSize: '24px', fontWeight: '900', margin: 0, fontFamily: 'var(--font-sketch)' }}>{currentPct.toFixed(2)}%</p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '99px', border: '2px solid #000',
            background: badge.bg, color: badge.color, fontSize: '12px', fontWeight: '800'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: badge.dot }} />
            {badge.text}
          </div>
        </div>

        <div style={{ padding: '10px 12px', background: '#F4F4F5', border: '2px solid #000', borderRadius: '8px', marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: '800', margin: '0 0 2px', textTransform: 'uppercase' }}>Buffer</p>
          <p style={{ fontSize: '13px', fontWeight: '700', margin: 0, fontFamily: 'var(--font-sketch)' }}>{bufferText}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px', fontSize: '12px', fontWeight: '600' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>If <strong style={{ color: '#0F5132' }}>Present</strong> Next Session</span>
            <span style={{ fontWeight: '800' }}>→ {attend1.toFixed(2)}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>If <strong style={{ color: '#842029' }}>Absent</strong> Next Session</span>
            <span style={{ fontWeight: '800' }}>→ {miss1.toFixed(2)}%</span>
          </div>
        </div>

        <button 
          onClick={() => setActiveModal('planner')} 
          className="brutal-btn" 
          style={{ width: '100%', padding: '10px', background: '#FFFFFF' }}
        >
          <Target size={14} /> View Detailed Planner
        </button>
      </div>

      {/* ── CARD 2: Academic Toolkit ── */}
      <div className="brutal-card" style={{ padding: '20px' }}>
        <p style={{ fontSize: '14px', fontWeight: '900', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-sketch)' }}>
          <GraduationCap size={16} color="#000000" /> Academic Tools
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button onClick={() => setActiveModal('sgpa')} className="brutal-btn" style={{ background: '#FFFFFF', padding: '10px 8px', fontSize: '12px' }}>
            SGPA Calc
          </button>
          <button onClick={() => setActiveModal('cgpa')} className="brutal-btn" style={{ background: '#FFFFFF', padding: '10px 8px', fontSize: '12px' }}>
            CGPA Calc
          </button>
          <button onClick={() => setActiveModal('c2p')} className="brutal-btn" style={{ background: '#FFFFFF', padding: '10px 8px', fontSize: '12px' }}>
            CGPA → %
          </button>
          <button onClick={() => setActiveModal('p2c')} className="brutal-btn" style={{ background: '#FFFFFF', padding: '10px 8px', fontSize: '12px' }}>
            % → CGPA
          </button>
        </div>
      </div>

      {/* ── Modal Mounting ── */}
      <AttendancePlannerModal isOpen={activeModal === 'planner'} onClose={() => setActiveModal(null)} stats={stats} />
      <SGPAModal isOpen={activeModal === 'sgpa'} onClose={() => setActiveModal(null)} />
      <CGPAModal isOpen={activeModal === 'cgpa'} onClose={() => setActiveModal(null)} />
      <CGPAToPercentModal isOpen={activeModal === 'c2p'} onClose={() => setActiveModal(null)} />
      <PercentToCGPAModal isOpen={activeModal === 'p2c'} onClose={() => setActiveModal(null)} />

    </div>
  );
}
