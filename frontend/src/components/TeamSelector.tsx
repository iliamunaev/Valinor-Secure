import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Users } from "lucide-react";

const teams = [
  "Vulnerability Assessment Team",
  "Red Team", 
  "Pentest Team"
];

const TeamSelector: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = React.useState(teams[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span className="hidden md:inline">{selectedTeam}</span>
          <span className="md:hidden">Team</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {teams.map((team) => (
          <DropdownMenuItem
            key={team}
            onClick={() => setSelectedTeam(team)}
            className={`cursor-pointer ${
              selectedTeam === team ? 'bg-accent' : ''
            }`}
          >
            <Users className="mr-2 h-4 w-4" />
            {team}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TeamSelector;