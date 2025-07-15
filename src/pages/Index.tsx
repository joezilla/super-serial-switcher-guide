import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowDown, ArrowUp, Zap, Printer, Wifi, Settings, ChevronRight } from 'lucide-react';

const Index = () => {
  const [jumperMode, setJumperMode] = useState<'printer' | 'modem'>('modem');
  const [operationMode, setOperationMode] = useState<'modem' | 'printer'>('modem');
  const [baudRate, setBaudRate] = useState('9600');
  const [dataBits, setDataBits] = useState('8');
  const [parity, setParity] = useState('none');
  const [stopBits, setStopBits] = useState('1');
  const [autoLineFeed, setAutoLineFeed] = useState(false);
  const [enableInterrupts, setEnableInterrupts] = useState(true);
  const [lineWidth, setLineWidth] = useState('80');
  const [videoOutput, setVideoOutput] = useState(false);
  const [returnDelay, setReturnDelay] = useState(false);

  const baudRates = [
    { value: '50', sw1: [true, true, true, false] },
    { value: '75', sw1: [true, true, false, true] },
    { value: '110', sw1: [true, true, false, false] },
    { value: '135', sw1: [true, false, true, true] },
    { value: '150', sw1: [true, false, true, false] },
    { value: '300', sw1: [true, false, false, true] },
    { value: '600', sw1: [true, false, false, false] },
    { value: '1200', sw1: [false, true, true, true] },
    { value: '1800', sw1: [false, true, true, false] },
    { value: '2400', sw1: [false, true, false, true] },
    { value: '3600', sw1: [false, true, false, false] },
    { value: '4800', sw1: [false, false, true, true] },
    { value: '7200', sw1: [false, false, true, false] },
    { value: '9600', sw1: [false, false, false, true] },
    { value: '19200', sw1: [false, false, false, false] },
  ];

  const getSW1Settings = () => {
    const baudConfig = baudRates.find(b => b.value === baudRate)?.sw1 || [false, false, false, true];
    const sw1_5 = operationMode === 'modem';
    const sw1_6 = true; // Always on for both modes
    const sw1_7 = true; // Always on for both modes
    
    return [...baudConfig, sw1_5, sw1_6, sw1_7];
  };

  const getSW2Settings = () => {
    let sw2_1, sw2_2, sw2_3, sw2_4;
    
    if (operationMode === 'modem') {
      // Modem mode settings based on data bits, parity, and stop bits
      const dataIs8 = dataBits === '8';
      const parityNone = parity === 'none';
      const stopIs1 = stopBits === '1';
      
      if (dataIs8) {
        sw2_1 = true;
        sw2_2 = true;
      } else {
        sw2_1 = true;
        sw2_2 = false;
      }
      
      if (stopIs1) {
        sw2_3 = parityNone ? false : (parity === 'odd' ? true : false);
        sw2_4 = parityNone ? true : false;
      } else {
        sw2_3 = parityNone ? false : (parity === 'odd' ? true : false);
        sw2_4 = parityNone ? true : false;
      }
      
      if (!stopIs1) {
        sw2_1 = false;
      }
    } else {
      // Printer mode settings
      sw2_1 = true; // Default 8 data, 1 stop
      sw2_2 = returnDelay; // 32ms delay after RETURN
      
      // Line width and video output
      const widthMap = {
        '40': [true, true],
        '72': [true, false],
        '80': [false, true],
        '132': [false, false],
      };
      
      const widthSettings = widthMap[lineWidth as keyof typeof widthMap] || [false, true];
      sw2_3 = widthSettings[0];
      sw2_4 = widthSettings[1];
    }
    
    const sw2_5 = autoLineFeed;
    const sw2_6 = enableInterrupts;
    const sw2_7 = operationMode === 'printer' && lineWidth === '40'; // Special case for some printers
    
    return [sw2_1, sw2_2, sw2_3, sw2_4, sw2_5, sw2_6, sw2_7];
  };

  const DipSwitchVisualization = ({ switches, label }: { switches: boolean[], label: string }) => (
    <div className="flex flex-col items-center space-y-2">
      <Label className="text-sm font-medium text-apple-screen">{label}</Label>
      <div className="flex space-x-1 p-2 bg-apple-screen rounded border">
        {switches.map((isOn, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="text-xs text-apple-text mb-1">{index + 1}</div>
            <div 
              className={`w-6 h-8 rounded-sm border-2 transition-all duration-300 ${
                isOn 
                  ? 'bg-apple-green border-apple-green shadow-retro' 
                  : 'bg-secondary border-border'
              }`}
            />
            <div className="text-xs text-apple-text mt-1">{isOn ? 'ON' : 'OFF'}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const getRecommendedSlot = () => {
    return operationMode === 'printer' ? 'Slot 1' : 'Slot 2';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-retro bg-clip-text text-transparent mb-2">
            Apple II Super Serial Card
          </h1>
          <p className="text-lg text-muted-foreground">
            Configuration Guide & DIP Switch Calculator
          </p>
          <Badge variant="outline" className="mt-2 border-apple-green text-apple-green">
            Recommended: {getRecommendedSlot()}
          </Badge>
        </div>

        {/* Configuration Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Jumper Block Configuration */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-apple-green" />
                Jumper Block Configuration
              </CardTitle>
              <CardDescription>
                Sets the physical connection mode for your serial device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={jumperMode} onValueChange={(value) => setJumperMode(value as 'printer' | 'modem')}>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="printer" id="printer-jumper" />
                  <Label htmlFor="printer-jumper" className="flex items-center gap-2 cursor-pointer">
                    <Printer className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Printer Mode</div>
                      <div className="text-sm text-muted-foreground">Arrow points DOWN</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="modem" id="modem-jumper" />
                  <Label htmlFor="modem-jumper" className="flex items-center gap-2 cursor-pointer">
                    <Wifi className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Modem Mode</div>
                      <div className="text-sm text-muted-foreground">Arrow points UP</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Operation Mode */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-apple-amber" />
                Operation Mode
              </CardTitle>
              <CardDescription>
                Choose your primary use case for the serial card
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={operationMode} onValueChange={(value) => setOperationMode(value as 'modem' | 'printer')}>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="modem" id="modem-op" />
                  <Label htmlFor="modem-op" className="cursor-pointer">
                    <div className="font-medium">Modem Operation</div>
                    <div className="text-sm text-muted-foreground">For modems and general serial communication</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="printer" id="printer-op" />
                  <Label htmlFor="printer-op" className="cursor-pointer">
                    <div className="font-medium">Printer Operation</div>
                    <div className="text-sm text-muted-foreground">For printers and printing devices</div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Serial Parameters */}
        <Card className="shadow-card mt-6">
          <CardHeader>
            <CardTitle>Serial Communication Parameters</CardTitle>
            <CardDescription>
              Configure the communication settings for your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="baud-rate">Baud Rate</Label>
                <Select value={baudRate} onValueChange={setBaudRate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select baud rate" />
                  </SelectTrigger>
                  <SelectContent>
                    {baudRates.map(rate => (
                      <SelectItem key={rate.value} value={rate.value}>
                        {rate.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {operationMode === 'modem' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="data-bits">Data Bits</Label>
                    <Select value={dataBits} onValueChange={setDataBits}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 bits</SelectItem>
                        <SelectItem value="8">8 bits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parity">Parity</Label>
                    <Select value={parity} onValueChange={setParity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="odd">Odd</SelectItem>
                        <SelectItem value="even">Even</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stop-bits">Stop Bits</Label>
                    <Select value={stopBits} onValueChange={setStopBits}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 bit</SelectItem>
                        <SelectItem value="2">2 bits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {operationMode === 'printer' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="line-width">Line Width</Label>
                    <Select value={lineWidth} onValueChange={setLineWidth}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="40">40 columns</SelectItem>
                        <SelectItem value="72">72 columns</SelectItem>
                        <SelectItem value="80">80 columns</SelectItem>
                        <SelectItem value="132">132 columns</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="return-delay"
                      checked={returnDelay}
                      onCheckedChange={setReturnDelay}
                    />
                    <Label htmlFor="return-delay">32ms Return Delay</Label>
                  </div>
                </>
              )}
            </div>

            <Separator className="my-4" />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-linefeed"
                  checked={autoLineFeed}
                  onCheckedChange={setAutoLineFeed}
                />
                <Label htmlFor="auto-linefeed">Auto Line Feed after CR</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-interrupts"
                  checked={enableInterrupts}
                  onCheckedChange={setEnableInterrupts}
                />
                <Label htmlFor="enable-interrupts">Enable Interrupts (recommended for ≥1200 baud)</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DIP Switch Settings */}
        <Card className="shadow-card mt-6">
          <CardHeader>
            <CardTitle>DIP Switch Configuration</CardTitle>
            <CardDescription>
              Set your physical DIP switches according to these settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8 md:grid-cols-2">
              <DipSwitchVisualization switches={getSW1Settings()} label="SW1 (Switches 1-7)" />
              <DipSwitchVisualization switches={getSW2Settings()} label="SW2 (Switches 1-7)" />
            </div>
            
            <div className="mt-6 p-4 bg-gradient-screen rounded-lg border">
              <h3 className="font-semibold text-apple-text mb-2">Configuration Summary:</h3>
              <div className="text-sm text-apple-text space-y-1">
                <div>• Jumper Block: {jumperMode === 'printer' ? 'Arrow DOWN (Printer)' : 'Arrow UP (Modem)'}</div>
                <div>• Operation Mode: {operationMode === 'modem' ? 'Modem' : 'Printer'}</div>
                <div>• Baud Rate: {baudRate}</div>
                {operationMode === 'modem' && (
                  <div>• Data Format: {dataBits} data bits, {parity} parity, {stopBits} stop bit{stopBits === '2' ? 's' : ''}</div>
                )}
                {operationMode === 'printer' && (
                  <div>• Line Width: {lineWidth} columns</div>
                )}
                <div>• Recommended Slot: {getRecommendedSlot()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
