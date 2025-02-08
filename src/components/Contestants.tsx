import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Contestant } from '../types';
import { Plus, Edit, Trash } from 'lucide-react';

export default function Contestants() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [newContestant, setNewContestant] = useState({ name: '', email: '' });
  const [showNewContestant, setShowNewContestant] = useState(false);
  const [editingContestant, setEditingContestant] = useState<Contestant | null>(null);

  useEffect(() => {
    fetchContestants();
  }, []);

  async function fetchContestants() {
    const { data, error } = await supabase
      .from('contestants')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching contestants:', error);
    else setContestants(data || []);
  }

  async function createContestant(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase
      .from('contestants')
      .insert([newContestant]);
    
    if (error) console.error('Error creating contestant:', error);
    else {
      setNewContestant({ name: '', email: '' });
      setShowNewContestant(false);
      fetchContestants();
    }
  }

  async function updateContestant(e: React.FormEvent) {
    e.preventDefault();
    if (!editingContestant) return;

    const { error } = await supabase
      .from('contestants')
      .update({ name: editingContestant.name, email: editingContestant.email })
      .eq('id', editingContestant.id);
    
    if (error) console.error('Error updating contestant:', error);
    else {
      setEditingContestant(null);
      fetchContestants();
    }
  }

  async function deleteContestant(id: string) {
    const { error } = await supabase
      .from('contestants')
      .delete()
      .eq('id', id);
    
    if (error) console.error('Error deleting contestant:', error);
    else fetchContestants();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Contestants</h1>
        <button
          onClick={() => setShowNewContestant(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Contestant
        </button>
      </div>

      {(showNewContestant || editingContestant) && (
        <form onSubmit={editingContestant ? updateContestant : createContestant} className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={editingContestant ? editingContestant.name : newContestant.name}
                onChange={(e) => editingContestant 
                  ? setEditingContestant({ ...editingContestant, name: e.target.value })
                  : setNewContestant({ ...newContestant, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={editingContestant ? editingContestant.email : newContestant.email}
                onChange={(e) => editingContestant
                  ? setEditingContestant({ ...editingContestant, email: e.target.value })
                  : setNewContestant({ ...newContestant, email: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowNewContestant(false);
                  setEditingContestant(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {editingContestant ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contestants.map((contestant) => (
              <tr key={contestant.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {contestant.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {contestant.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(contestant.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setEditingContestant(contestant)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteContestant(contestant.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}