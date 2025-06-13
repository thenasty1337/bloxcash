'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  Plus, 
  Trash2, 
  Shield, 
  Filter,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { clientApi } from '@/lib/client-api';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Phrase {
  id: number;
  phrase: string;
  createdAt: string;
}

interface PhrasesResponse {
  page: number;
  pages: number;
  total: number;
  data: Phrase[];
}

export function FilterPageContent() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [newPhrase, setNewPhrase] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPhrases, setShowPhrases] = useState(false);

  const fetchPhrases = async (page: number = 1, search: string = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await clientApi<PhrasesResponse>(`/admin/phrases?${params.toString()}`);
      setPhrases(response.data);
      setCurrentPage(response.page);
      setTotalPages(response.pages);
      setTotalCount(response.total);
    } catch (error: any) {
      if (error.message?.includes('2FA_REQUIRED')) {
        toast.error('2FA verification required');
      } else {
        toast.error('Failed to fetch phrases');
      }
      console.error('Error fetching phrases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPhrases(1, searchTerm);
  };

  const handleAddPhrase = async () => {
    if (!newPhrase.trim()) {
      toast.error('Please enter a phrase');
      return;
    }

    if (newPhrase.length < 2 || newPhrase.length > 32) {
      toast.error('Phrase must be between 2 and 32 characters');
      return;
    }

    setActionLoading(true);
    try {
      await clientApi('/admin/phrases/add', {
        method: 'POST',
        body: JSON.stringify({ phrase: newPhrase.trim() })
      });
      
      toast.success(`Successfully added "${newPhrase.trim()}" to the word filter`);
      setNewPhrase('');
      setAddDialogOpen(false);
      
      // Refresh the current view
      fetchPhrases(currentPage, searchTerm);
    } catch (error: any) {
      if (error.message?.includes('PHRASE_ALREADY_EXISTS')) {
        toast.error('This phrase already exists in the filter');
      } else if (error.message?.includes('INVALID_PHRASE')) {
        toast.error('Invalid phrase format');
      } else {
        toast.error('Failed to add phrase');
      }
      console.error('Error adding phrase:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemovePhrase = async (phraseId: number, phraseText: string) => {
    setActionLoading(true);
    try {
      await clientApi(`/admin/phrases/${phraseId}/remove`, {
        method: 'POST'
      });
      
      toast.success(`Successfully removed "${phraseText}" from the word filter`);
      
      // Refresh the current view
      fetchPhrases(currentPage, searchTerm);
    } catch (error: any) {
      if (error.message?.includes('PHRASE_NOT_FOUND')) {
        toast.error('Phrase not found');
      } else {
        toast.error('Failed to remove phrase');
      }
      console.error('Error removing phrase:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPhrases(page, searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddPhrase();
    }
  };

  useEffect(() => {
    fetchPhrases();
  }, []);

  return (
    <div className="flex flex-1 flex-col space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Content Filter</h1>
            <p className="text-muted-foreground">Manage blocked words and phrases</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPhrases(!showPhrases)}
            >
              {showPhrases ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Phrases
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Phrases
                </>
              )}
            </Button>
            
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Phrase
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Phrase</DialogTitle>
                  <DialogDescription>
                    Add a new word or phrase to the content filter. This will be blocked across the platform.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-phrase">Phrase</Label>
                    <Input
                      id="new-phrase"
                      placeholder="Enter phrase to block..."
                      value={newPhrase}
                      onChange={(e) => setNewPhrase(e.target.value)}
                      onKeyPress={handleAddKeyPress}
                      maxLength={32}
                    />
                    <div className="text-xs text-muted-foreground">
                      {newPhrase.length}/32 characters
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setAddDialogOpen(false);
                      setNewPhrase('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddPhrase}
                    disabled={actionLoading || !newPhrase.trim()}
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Phrase
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Blocked Phrases</p>
                  <p className="text-2xl font-bold">{totalCount.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Filter Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Phrases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Search for phrases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Phrases Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtered Phrases</CardTitle>
            {totalPages > 1 && (
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({totalCount} total)
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading phrases...</span>
            </div>
          ) : phrases.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">No phrases found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'Add your first phrase to get started'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phrase</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {phrases.map((phrase) => (
                    <TableRow key={phrase.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="font-mono">
                            {showPhrases ? phrase.phrase : '*'.repeat(phrase.phrase.length)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(phrase.createdAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={actionLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Phrase</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove &ldquo;{showPhrases ? phrase.phrase : '[hidden]'}&rdquo; from the content filter?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemovePhrase(phrase.id, phrase.phrase)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remove Phrase
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 