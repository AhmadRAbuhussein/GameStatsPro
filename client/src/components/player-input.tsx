import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GameType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Search, User, AlertTriangle } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface PlayerInputProps {
  selectedGame: GameType;
  onSubmit: (playerId: string, region?: string) => void;
  onBack: () => void;
}

const formSchema = z.object({
  playerId: z.string().min(1, "Player ID is required"),
  region: z.string().optional(),
});

const gameDetails = {
  lol: {
    name: "League of Legends",
    description: "Please enter your summoner name to fetch your statistics",
    placeholder: "Enter your summoner name",
    regions: [
      { value: "na1", label: "North America" },
      { value: "euw1", label: "Europe West" },
      { value: "eune1", label: "Europe Nordic & East" },
      { value: "kr", label: "Korea" },
      { value: "jp1", label: "Japan" },
      { value: "br1", label: "Brazil" },
      { value: "la1", label: "Latin America North" },
      { value: "la2", label: "Latin America South" },
      { value: "oc1", label: "Oceania" },
      { value: "tr1", label: "Turkey" },
      { value: "ru", label: "Russia" },
    ],
  },
  steam: {
    name: "Steam Games",
    description: "Please enter your Steam ID to fetch your statistics",
    placeholder: "Enter your Steam ID (e.g., 76561198000000000)",
    regions: [],
  },
  valorant: {
    name: "Valorant",
    description: "Please enter your Riot ID to fetch your statistics",
    placeholder: "Enter your Riot ID (Name#Tag)",
    regions: [
      { value: "na", label: "North America" },
      { value: "eu", label: "Europe" },
      { value: "ap", label: "Asia Pacific" },
      { value: "kr", label: "Korea" },
    ],
  },
  cs2: {
    name: "Counter-Strike 2",
    description: "Please enter your Steam ID to fetch your statistics",
    placeholder: "Enter your Steam ID",
    regions: [],
  },
  dota2: {
    name: "Dota 2",
    description: "Please enter your Steam ID to fetch your statistics",
    placeholder: "Enter your Steam ID",
    regions: [],
  },
};

export default function PlayerInput({ selectedGame, onSubmit, onBack }: PlayerInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const gameInfo = gameDetails[selectedGame];
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerId: "",
      region: gameInfo.regions.length > 0 ? gameInfo.regions[0].value : undefined,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(values.playerId, values.region);
    } catch (err) {
      setError("Failed to validate player ID. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-200 mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Game Selection
          </button>
          
          <h2 className="text-3xl font-bold mb-4 text-white" data-testid="input-title">
            {gameInfo.name}
          </h2>
          <p className="text-gray-400" data-testid="input-description">
            {gameInfo.description}
          </p>
        </div>

        <div 
          className="rounded-xl border p-8"
          style={{ backgroundColor: 'var(--gaming-secondary)', borderColor: 'var(--gaming-accent)' }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="playerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300" data-testid="label-player-id">
                      Player ID / Username
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder={gameInfo.placeholder}
                          className="pl-10"
                          style={{ 
                            backgroundColor: 'var(--gaming-dark)', 
                            borderColor: 'var(--gaming-accent)',
                            color: 'white'
                          }}
                          data-testid="input-player-id"
                        />
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <p className="text-sm text-gray-400" data-testid="help-text">
                      This will be used to fetch your game statistics via API
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {gameInfo.regions.length > 0 && (
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300" data-testid="label-region">
                        Region
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger 
                            style={{ 
                              backgroundColor: 'var(--gaming-dark)', 
                              borderColor: 'var(--gaming-accent)',
                              color: 'white'
                            }}
                            data-testid="select-region"
                          >
                            <SelectValue placeholder="Select your region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {gameInfo.regions.map((region) => (
                            <SelectItem key={region.value} value={region.value} data-testid={`option-region-${region.value}`}>
                              {region.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full font-semibold text-white hover:shadow-lg hover:scale-105 transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, var(--gaming-pink), var(--gaming-blue))' }}
                data-testid="button-analyze"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Analyzing Performance...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyze My Performance
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Error Message */}
        {error && (
          <Alert className="mt-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--gaming-error)' }}>
            <AlertTriangle className="h-4 w-4" style={{ color: 'var(--gaming-error)' }} />
            <AlertDescription className="text-gray-300" data-testid="error-message">
              <strong style={{ color: 'var(--gaming-error)' }}>Player Not Found</strong>
              <br />
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div 
            className="rounded-lg p-8 mt-4"
            style={{ backgroundColor: 'var(--gaming-secondary)' }}
          >
            <div className="flex items-center justify-center">
              <LoadingSpinner className="mr-4" />
              <span className="text-gray-300" data-testid="loading-text">Fetching your game data...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
