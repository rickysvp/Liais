import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Simple, predictable pricing</h1>
        <p className="text-xl text-slate-600">Invest in your inbound workflow. No hidden fees.</p>
      </div>
      
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">Free</CardTitle>
            <CardDescription>Perfect to test the waters</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-slate-500">/month</span>
            </div>
            <ul className="space-y-3 text-slate-600 text-sm">
              <li>10 Credits / month</li>
              <li>Basic AI Visitor Intake</li>
              <li>AI Structured Summaries</li>
              <li>Standard Profile</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Current Plan</Button>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col border-blue-200 shadow-blue-100 shadow-xl relative scale-105">
          <div className="absolute top-0 inset-x-0 h-1 bg-blue-600 rounded-t-xl"></div>
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900">Pro</CardTitle>
            <CardDescription>For growing professionals</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-slate-500">/month</span>
            </div>
            <ul className="space-y-3 text-slate-600 text-sm">
              <li>200 Credits / month</li>
              <li>Everything in Free</li>
              <li>Reply Generation</li>
              <li>Deep Qualification analysis</li>
              <li>Custom AI Secretary Tone</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Upgrade to Pro</Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">Business</CardTitle>
            <CardDescription>For intense inbound volume</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-bold">$99</span>
              <span className="text-slate-500">/month</span>
            </div>
            <ul className="space-y-3 text-slate-600 text-sm">
              <li>1000 Credits / month</li>
              <li>Everything in Pro</li>
              <li>Advanced Executive Briefs</li>
              <li>Webhook Hand-off</li>
              <li>Priority Support</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Upgrade to Business</Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
