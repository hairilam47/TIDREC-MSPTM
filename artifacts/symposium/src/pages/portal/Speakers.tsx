import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetSpeakers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

export default function Speakers() {
  const { data: speakers, isLoading } = useGetSpeakers();

  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Invited Speakers</h1>
        <p className="text-muted-foreground">Discover the experts presenting at SATBDS 2027.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {speakers?.map((speaker) => (
            <Card key={speaker.id} className="text-center hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24 border-2 border-primary/20">
                    <AvatarImage src={speaker.photoUrl || ''} alt={speaker.name} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {speaker.initials || speaker.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-lg font-serif">{speaker.name}</CardTitle>
                <div className="text-sm font-medium text-muted-foreground mt-1">
                  {speaker.institution && <span>{speaker.institution}, </span>}
                  <span>{speaker.country}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm bg-muted/50 p-3 rounded-md mb-3">
                  <span className="font-semibold text-xs uppercase tracking-wider text-primary block mb-1">Topic</span>
                  {speaker.topic}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
