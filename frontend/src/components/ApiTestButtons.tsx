import { getScanHistory } from '../api/get/getScanHistory';
import { Button } from '../ui/button';

interface ApiTestButtonsProps {
  children?: React.ReactNode;
}

export function ApiTestButtons({ children }: ApiTestButtonsProps) {
  const testAssessUrl = async () => {
    try {
      console.log("Testing /assess endpoint...");
    //   const result = await assessUrl({ url: "https://example.com" });
    //   console.log("✅ Assessment result:", result);
    //   alert(`Assessment successful! Trust score: ${result.summary.trust_score}`);
    } catch (error) {
      console.error("❌ Assessment failed:", error);
      alert(`Assessment failed: ${error}`);
    }
  };

  const testGetScanHistory = async () => {
    try {
      console.log("Testing /input endpoint...");
      const result = await getScanHistory();
      console.log("✅ Scan history result:", result);
      alert(`Scan history retrieved! Got ${Array.isArray(result) ? result.length : 'unknown'} items`);
    } catch (error) {
      console.error("❌ Get scan history failed:", error);
      alert(`Get scan history failed: ${error}`);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg space-y-2">
      <h3 className="text-lg font-semibold text-white mb-2">{children || "API Test Buttons"}</h3>
      <div className="space-y-2">
        {/* <Button onClick={testAssessUrl} className="w-full">
          Test Assess URL (/assess)
        </Button> */}
        <Button onClick={testGetScanHistory} className="w-full" variant="outline">
          Test Get Scan History (/input)
        </Button>
      </div>
    </div>
  );
}
