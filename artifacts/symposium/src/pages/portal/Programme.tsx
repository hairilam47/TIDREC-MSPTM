import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetSessions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, MapPin } from "lucide-react";

export default function Programme() {
  const { data: sessions, isLoading } = useGetSessions();

  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Scientific Programme</h1>
        <p className="text-muted-foreground">Explore the schedule of keynotes, panels, and presentations.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-8">
          {[1, 2].map(day => {
            const daySessions = sessions?.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime)) || [];
            
            if (daySessions.length === 0) return null;
            
            return (
              <div key={day} className="space-y-4">
                <h2 className="text-2xl font-serif font-bold border-b border-border pb-2">
                  Day {day} <span className="text-muted-foreground text-lg ml-2 font-sans font-normal">March {day + 21}, 2027</span>
                </h2>
                <div className="space-y-4">
                  {daySessions.map(session => (
                    <Card key={session.id} className="overflow-hidden border-l-4 border-l-primary">
                      <CardContent className="p-0 sm:flex">
                        <div className="bg-muted/30 p-4 sm:w-48 sm:shrink-0 flex flex-col justify-center border-r border-border">
                          <div className="font-bold flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {session.startTime} {session.endTime ? `- ${session.endTime}` : ''}
                          </div>
                          {session.room && (
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {session.room}
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="capitalize text-xs">
                              {session.sessionType}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-serif font-bold mb-2">{session.title}</h3>
                          {session.speakerName && (
                            <p className="text-sm font-medium text-primary mb-2">Speaker: {session.speakerName}</p>
                          )}
                          {session.description && (
                            <p className="text-muted-foreground text-sm line-clamp-2">{session.description}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PortalLayout>
  );
}
