import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface PersonFormProps {
  person: {
    name: string;
    dob: string;
    gender: string;
  };
  setter: (updater: (prev: any) => any) => void;
  label: string;
}

export function PersonForm({ person, setter, label }: PersonFormProps) {
  const inp = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setter(p => ({ ...p, [f]: e.target.value }));

  const inputStyle = {
    background: "rgba(255,255,255,0.07)",
    border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: 9,
    color: "#fff",
    padding: "7px 11px",
    fontSize: 13,
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const
  };

  return (
    <div className="flex-1 bg-white/[0.04] rounded-organic p-3.5">
      <div className="text-white/45 text-[11px] mb-2">{label}</div>

      <input
        placeholder="Name (optional)"
        value={person.name}
        onChange={inp("name")}
        style={{ ...inputStyle, marginBottom: 7 }}
      />

      <input
        type="date"
        value={person.dob}
        onChange={inp("dob")}
        style={{ ...inputStyle, marginBottom: 7 }}
      />

      <div className="flex gap-1.5">
        {["M", "F"].map(g => (
          <button
            key={g}
            onClick={() => setter(p => ({ ...p, gender: g }))}
            className="flex-1 py-1.5 rounded-lg border-none cursor-pointer text-[12px] font-bold transition-all"
            style={{
              background: person.gender === g
                ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                : "rgba(255,255,255,0.07)",
              color: person.gender === g ? "#fff" : "rgba(255,255,255,0.4)",
              boxShadow: person.gender === g ? "0 0 10px rgba(139,92,246,0.4)" : "none"
            }}
          >
            {g === "M" ? "♂ Male" : "♀ Female"}
          </button>
        ))}
      </div>
    </div>
  );
}
