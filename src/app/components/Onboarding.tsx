import { motion } from 'motion/react';
import AppleMascot from './AppleMascot';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        className="max-w-2xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center gap-8">
          <AppleMascot emotion="waving" size="lg" />

          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-4xl text-[#3d3244]">Welcome to Perspekta</h1>
            <p className="text-lg text-[#B5A4AC] max-w-xl mx-auto">
              A gentle space for cognitive reflection and reframing difficult thoughts
            </p>
          </motion.div>

          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 space-y-6 border border-[#F1C6D9]/20 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <h2 className="text-xl text-[#3d3244]">How Perspekta Works</h2>
            <ul className="space-y-4 text-[#3d3244]">
              <li className="flex gap-3">
                <span className="text-[#F1C6D9] flex-shrink-0">✦</span>
                <span>Share a distressing thought in a safe, private space</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#F1C6D9] flex-shrink-0">✦</span>
                <span>Explore evidence and alternative perspectives using CBT-inspired techniques</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#F1C6D9] flex-shrink-0">✦</span>
                <span>Build a more balanced view of the situation</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#F1C6D9] flex-shrink-0">✦</span>
                <span>Step away and engage with real-world activities</span>
              </li>
            </ul>

            <div className="pt-6 border-t border-[#F1C6D9]/20 space-y-4">
              <h3 className="font-medium text-[#3d3244]">Important Safety Information</h3>
              <div className="text-sm text-[#B5A4AC] space-y-3 bg-[#ffffff] rounded-2xl p-6">
                <p>
                  Perspekta is a self-reflection tool inspired by Cognitive Behavioral Therapy
                  principles. It is <strong>not a replacement</strong> for professional mental health
                  care, therapy, or medical treatment.
                </p>
                <p>
                  If you're experiencing severe distress, thoughts of self-harm, or a mental health
                  crisis, please reach out to a trusted friend, family member, or contact a
                  professional support service immediately.
                </p>
                <div className="font-medium text-[#3d3244] space-y-2 pt-2">
                  <p className="font-semibold">24/7 Crisis Resources:</p>
                  <ul className="space-y-1 text-sm">
                    <li>• <strong>988 Suicide & Crisis Lifeline:</strong> Call or text 988</li>
                    <li>• <strong>Crisis Text Line:</strong> Text HOME to 741741</li>
                    <li>• <strong>SAMHSA National Helpline:</strong> 1-800-662-4357</li>
                    <li>• <strong>Veterans Crisis Line:</strong> 988 then press 1, or text 838255</li>
                    <li>• <strong>Trevor Project (LGBTQ+ Youth):</strong> 1-866-488-7386 or text START to 678678</li>
                    <li>• <strong>NAMI Helpline:</strong> 1-800-950-6264</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.button
            className="px-8 py-4 bg-[#F1C6D9] text-white rounded-full hover:bg-[#e5b0c7] transition-colors shadow-sm"
            onClick={onComplete}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            I Understand, Let's Begin
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
