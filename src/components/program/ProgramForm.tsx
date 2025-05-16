"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Program } from '@/domain/entities/Program';
import { WorkoutType } from '@/domain/entities/WorkoutSession';
import { ProgramExercise } from '@/domain/entities/Program';

interface ProgramFormProps {
  program?: Program;
  onSave: (program: Partial<Program>) => void;
  onCancel?: () => void;
}

export function ProgramForm({ program, onSave, onCancel }: ProgramFormProps) {
  // Form state
  const [name, setName] = useState(program?.name || '');
  const [type, setType] = useState<WorkoutType>(program?.type || 'crossfit');
  const [description, setDescription] = useState(program?.description || '');
  const [exercises, setExercises] = useState<ProgramExercise[]>(Array.isArray(program?.exercises) && program?.exercises ? program?.exercises : Object.values(program?.exercises || []) || []);

  // New exercise form state
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseSets, setNewExerciseSets] = useState('3');
  const [newExerciseReps, setNewExerciseReps] = useState('10');
  const [newExerciseWeight, setNewExerciseWeight] = useState('');
  const [newExerciseDuration, setNewExerciseDuration] = useState('');
  const [newExerciseNotes, setNewExerciseNotes] = useState('');

  // Handle adding a new exercise
  const handleAddExercise = () => {
    if (!newExerciseName.trim()) return;

    // Validate and parse numeric values
    const sets = parseInt(newExerciseSets);
    const reps = parseInt(newExerciseReps);

    // Ensure sets and reps are valid numbers
    if (isNaN(sets) || isNaN(reps) || sets <= 0 || reps <= 0) {
      alert("Les séries et répétitions doivent être des nombres positifs valides");
      return;
    }

    const newExercise: ProgramExercise = {
      name: newExerciseName,
      sets: sets,
      reps: reps,
      weight: newExerciseWeight && !isNaN(parseInt(newExerciseWeight)) ? parseInt(newExerciseWeight) : undefined,
      duration: newExerciseDuration && !isNaN(parseInt(newExerciseDuration)) ? parseInt(newExerciseDuration) : undefined,
      notes: newExerciseNotes.trim() ? newExerciseNotes : undefined
    };

    setExercises([...exercises, newExercise]);

    // Reset form
    setNewExerciseName('');
    setNewExerciseSets('3');
    setNewExerciseReps('10');
    setNewExerciseWeight('');
    setNewExerciseDuration('');
    setNewExerciseNotes('');
  };

  // Handle removing an exercise
  const handleRemoveExercise = (index: number) => {
    const updatedExercises = [...exercises];
    updatedExercises.splice(index, 1);
    setExercises(updatedExercises);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!name.trim()) return;

    onSave({
      name,
      type,
      description: description.trim() ? description : undefined,
      exercises
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{program ? 'Modifier le Programme' : 'Créer un Programme'}</CardTitle>
        <CardDescription>
          {program 
            ? 'Mettre à jour les détails et exercices de votre programme d&apos;entraînement' 
            : 'Créer un nouveau programme d&apos;entraînement avec des exercices'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Program Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Détails du Programme</h3>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du Programme</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Entrez le nom du programme"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type d&apos;Entraînement</Label>
              <Select value={type} onValueChange={(value) => setType(value as WorkoutType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type d&apos;entraînement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crossfit">CrossFit</SelectItem>
                  <SelectItem value="pilates">Pilates</SelectItem>
                  <SelectItem value="gym">Salle de sport</SelectItem>
                  <SelectItem value="running">Course</SelectItem>
                  <SelectItem value="swimming">Natation</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Entrez la description du programme"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Exercices</h3>

          {exercises.length > 0 ? (
            <div className="space-y-4">
              {exercises.map((exercise, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{exercise?.name}</h4>
                      <p className="text-sm text-gray-500">
                        {exercise.sets} séries × {exercise.reps} répétitions
                        {exercise.weight ? ` @ ${exercise.weight}kg` : ''}
                        {exercise.duration ? ` pendant ${exercise.duration} min` : ''}
                      </p>
                      {exercise.notes && (
                        <p className="text-sm mt-1">{exercise.notes}</p>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveExercise(index)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Aucun exercice ajouté pour l&apos;instant. Ajoutez votre premier exercice ci-dessous.
            </div>
          )}

          {/* Add Exercise Form */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">Ajouter un Exercice</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exercise-name">Nom de l&apos;Exercice</Label>
                <Input
                  id="exercise-name"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="ex: Squats, Pompes"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="exercise-sets">Séries</Label>
                  <Input
                    id="exercise-sets"
                    type="number"
                    value={newExerciseSets}
                    onChange={(e) => setNewExerciseSets(e.target.value)}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exercise-reps">Répétitions</Label>
                  <Input
                    id="exercise-reps"
                    type="number"
                    value={newExerciseReps}
                    onChange={(e) => setNewExerciseReps(e.target.value)}
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exercise-weight">Poids (kg, optionnel)</Label>
                <Input
                  id="exercise-weight"
                  type="number"
                  value={newExerciseWeight}
                  onChange={(e) => setNewExerciseWeight(e.target.value)}
                  placeholder="Optionnel"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exercise-duration">Durée (min, optionnel)</Label>
                <Input
                  id="exercise-duration"
                  type="number"
                  value={newExerciseDuration}
                  onChange={(e) => setNewExerciseDuration(e.target.value)}
                  placeholder="Optionnel"
                  min="0"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="exercise-notes">Notes (optionnel)</Label>
                <Textarea
                  id="exercise-notes"
                  value={newExerciseNotes}
                  onChange={(e) => setNewExerciseNotes(e.target.value)}
                  placeholder="Notes supplémentaires sur cet exercice"
                  rows={2}
                />
              </div>

              <div className="md:col-span-2">
                <Button 
                  type="button" 
                  onClick={handleAddExercise}
                  disabled={!newExerciseName.trim()}
                  className="w-full"
                >
                  Ajouter l&apos;Exercice
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={!name.trim()}>
          {program ? 'Mettre à jour le Programme' : 'Créer le Programme'}
        </Button>
      </CardFooter>
    </Card>
  );
}
