import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Trash2, Edit, Plus, AlertCircle, Calendar, Lock, Unlock, Save, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { API_BASE_URL } from '../../../config.json';

interface Question {
  id: string;
  question: string;
  explanation: string;
  difficulty: Difficulty;
  category: Category;
  topicId?: string;
  topic?: Topic;
  options: Option[];
  createdAt: string;
}

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  availableFrom: Date | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Topic {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  order: number;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormData {
  name?: string;
  description?: string;
  availableFrom?: string;
  isActive?: boolean;
  order?: number;
  color?: string;
}

interface TopicFormData {
  name?: string;
  description?: string;
  categoryId?: string;
  slug?: string;
  icon?: string;
  color?: string;
  order?: number;
}

interface Difficulty {
  id: string;
  name: string;
  label: string;
  points: number;
  color?: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

interface QuestionForm {
  question: string;
  explanation: string;
  difficulty: string;
  category: string;
  topic: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
}

export default function AdminPage() {
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({});
  const [topicFormData, setTopicFormData] = useState<TopicFormData>({});
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [formData, setFormData] = useState<QuestionForm>({
    question: '',
    explanation: '',
    difficulty: '',
    category: '',
    topic: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  });

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [questionsRes, categoriesRes, topicsRes, difficultiesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/questions`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/topics`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/difficulties`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!questionsRes.ok) {
        const errorData = await questionsRes.json().catch(() => ({ message: 'Erro desconhecido' }));
        setError({
          status: questionsRes.status,
          message: errorData.message || 'Erro ao carregar dados do admin'
        });
        return;
      }

      const questionsData = await questionsRes.json();
      setQuestions(questionsData);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        
        if (categoriesData.success && Array.isArray(categoriesData.data)) {
          setCategories(categoriesData.data);
        } else if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        } else {
          setCategories([]);
        }
      } else {
        setCategories([]);
      }

      if (topicsRes.ok) {
        const topicsData = await topicsRes.json();
        
        if (topicsData.success && Array.isArray(topicsData.data)) {
          setTopics(topicsData.data);
        } else if (Array.isArray(topicsData)) {
          setTopics(topicsData);
        } else {
          console.error('Formato de resposta inválido para tópicos:', topicsData);
          setTopics([]);
        }
      } else {
        setTopics([]);
      }

      if (difficultiesRes.ok) {
        const difficultiesData = await difficultiesRes.json();
        
        if (Array.isArray(difficultiesData)) {
          setDifficulties(difficultiesData);
        } else {
          console.error('Formato de resposta inválido para dificuldades:', difficultiesData);
          setDifficulties([
            { id: '379740f7-49ed-46e4-85e8-b655fce8fc7d', name: 'easy', label: 'Fácil', points: 10, color: '#22c55e', order: 1 },
            { id: 'e15122fe-0d1b-485d-94ea-c95bc479ad30', name: 'medium', label: 'Médio', points: 20, color: '#f59e0b', order: 2 },
            { id: '38ae9e44-2beb-4ef9-b160-cf5e2c5cf3bd', name: 'hard', label: 'Difícil', points: 30, color: '#ef4444', order: 3 }
          ]);
        }
      } else {
        setDifficulties([
          { id: '379740f7-49ed-46e4-85e8-b655fce8fc7d', name: 'easy', label: 'Fácil', points: 10, color: '#22c55e', order: 1 },
          { id: 'e15122fe-0d1b-485d-94ea-c95bc479ad30', name: 'medium', label: 'Médio', points: 20, color: '#f59e0b', order: 2 },
          { id: '38ae9e44-2beb-4ef9-b160-cf5e2c5cf3bd', name: 'hard', label: 'Difícil', points: 30, color: '#ef4444', order: 3 }
        ]);
      }
    } catch (error) {
      setError({
        status: 500,
        message: 'Erro de conexão com o servidor'
      });
      setDifficulties([
        { id: '379740f7-49ed-46e4-85e8-b655fce8fc7d', name: 'easy', label: 'Fácil', points: 10, color: '#22c55e', order: 1 },
        { id: 'e15122fe-0d1b-485d-94ea-c95bc479ad30', name: 'medium', label: 'Médio', points: 20, color: '#f59e0b', order: 2 },
        { id: '38ae9e44-2beb-4ef9-b160-cf5e2c5cf3bd', name: 'hard', label: 'Difícil', points: 30, color: '#ef4444', order: 3 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopicsByCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}/topics`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setAvailableTopics(result.data);
        } else {
          setAvailableTopics([]);
        }
      } else {
        setAvailableTopics([]);
      }
    } catch (error) {
      console.error('Erro ao buscar tópicos:', error);
      setAvailableTopics([]);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData({ ...formData, category: categoryId, topic: '' });
    if (categoryId) {
      fetchTopicsByCategory(categoryId);
    } else {
      setAvailableTopics([]);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      explanation: '',
      difficulty: '',
      category: '',
      topic: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    });
    setEditingQuestion(null);
  };

  const startEditingCategory = (category: Category) => {
    setEditingCategory(category.id);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      availableFrom: category.availableFrom 
        ? new Date(category.availableFrom).toISOString().split('T')[0]
        : '',
      isActive: category.isActive, 
      order: category.order,
      color: category.color || ''
    });
  };

  const handleSaveCategory = async (categoryId: string) => {
    try {
      const updateData = {
        ...categoryFormData,
        availableFrom: categoryFormData.availableFrom ? categoryFormData.availableFrom : null
      };

      const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setEditingCategory(null);
        setCategoryFormData({});
        fetchData();
        alert('Categoria atualizada com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria');
    }
  };

  const handleCreateTopic = async () => {
    try {
      if (!topicFormData.name || !topicFormData.categoryId) {
        alert('Nome e categoria são obrigatórios');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...topicFormData,
          slug: topicFormData.slug || topicFormData.name?.toLowerCase().replace(/\s+/g, '-'),
          order: topicFormData.order || topics.length + 1,
          isActive: true
        })
      });

      if (response.ok) {
        setIsTopicDialogOpen(false);
        setTopicFormData({});
        setEditingTopic(null);
        fetchData();
        alert('Tópico criado com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erro ao criar tópico:', error);
      alert('Erro ao criar tópico');
    }
  };

  const handleUpdateTopic = async (topicId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/topics/${topicId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(topicFormData)
      });

      if (response.ok) {
        setIsTopicDialogOpen(false);
        setTopicFormData({});
        setEditingTopic(null);
        fetchData();
        alert('Tópico atualizado com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar tópico:', error);
      alert('Erro ao atualizar tópico');
    }
  };

  const handleDeleteTopic = async (topicId: string, topicName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o tópico "${topicName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/topics/${topicId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchData();
        alert('Tópico excluído com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erro ao excluir tópico:', error);
      alert('Erro ao excluir tópico');
    }
  };

  const startEditingTopic = (topic: Topic) => {
    setEditingTopic(topic.id);
    setTopicFormData({
      name: topic.name,
      description: topic.description || '',
      categoryId: topic.categoryId,
      slug: topic.slug,
      icon: topic.icon || '',
      color: topic.color || '',
      order: topic.order
    });
    setIsTopicDialogOpen(true);
  };

  const handleCreateCategory = async () => {
    try {
      if (!categoryFormData.name) {
        alert('Nome é obrigatório');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...categoryFormData,
          slug: categoryFormData.name?.toLowerCase().replace(/\s+/g, '-'),
          order: categoryFormData.order || categories.length + 1,
          isActive: categoryFormData.isActive !== false,
          availableFrom: categoryFormData.availableFrom || null
        })
      });

      if (response.ok) {
        setIsCategoryDialogOpen(false);
        setCategoryFormData({});
        setEditingCategory(null);
        fetchData();
        alert('Categoria criada com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      alert('Erro ao criar categoria');
    }
  };

  const getCategoryStatus = (category: Category) => {
    if (!category.isActive) return 'inactive';
    if (!category.availableFrom) return 'available'; // Sem data = sempre disponível
    
    const now = new Date();
    let availableFrom;
    
    const dateValue = category.availableFrom as any;
    
    if (typeof dateValue === 'string' && dateValue.includes('T')) {
      const datePart = dateValue.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      availableFrom = new Date(year, month - 1, day);
    } else if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateValue.split('-').map(Number);
      availableFrom = new Date(year, month - 1, day);
    } else {
      availableFrom = new Date(dateValue);
    }
    
    if (isNaN(availableFrom.getTime())) {
      console.warn('Data inválida encontrada para categoria:', category.name, 'Data:', category.availableFrom);
      return 'available';
    }
    
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const availableDate = new Date(availableFrom.getFullYear(), availableFrom.getMonth(), availableFrom.getDate());
    
    console.log('Data de hoje: ', todayDate);
    console.log('Data de inicio: ', availableDate);
    if (todayDate >= availableDate) return 'available';
    return 'coming-soon';
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Sem data definida';
    
    try {
      let dateToFormat;
      
      if (typeof date === 'string' && date.includes('T')) {
        const datePart = date.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        dateToFormat = new Date(year, month - 1, day);
      }
      else if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split('-').map(Number);
        dateToFormat = new Date(year, month - 1, day);
      } 
      else {
        dateToFormat = new Date(date);
      }
      
      if (isNaN(dateToFormat.getTime())) {
        return 'Data inválida';
      }

      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(dateToFormat);
    } catch (error) {
      console.warn('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.category || !formData.topic || !formData.explanation.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios (pergunta, categoria, tópico, explicação).');
      return;
    }

    const validOptions = formData.options.filter(opt => opt.text.trim());
    if (validOptions.length < 2) {
      alert('É necessário ter pelo menos 2 opções.');
      return;
    }

    const correctOptions = validOptions.filter(opt => opt.isCorrect);
    if (correctOptions.length !== 1) {
      alert('É necessário ter exatamente 1 opção correta.');
      return;
    }

    try {
      const method = editingQuestion ? 'PUT' : 'POST';
      const url = editingQuestion 
        ? `${API_BASE_URL}/api/admin/questions/${editingQuestion.id}`
        : `${API_BASE_URL}/api/admin/questions`;

      const requestData = {
        question: formData.question.trim(),
        explanation: formData.explanation.trim(),
        category: formData.category,
        topicId: formData.topic,
        difficulty: formData.difficulty,
        options: validOptions.map(opt => ({
          text: opt.text.trim(),
          isCorrect: opt.isCorrect
        }))
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        await fetchData();
        setIsDialogOpen(false);
        resetForm();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        alert(`Erro ${response.status}: ${errorData.message || 'Erro ao salvar pergunta'}`);
      }
    } catch (error) {
      alert('Erro de conexão: Não foi possível salvar a pergunta');
    }
  };

  const handleEdit = async (question: Question) => {
    const newFormData = {
      question: question.question,
      explanation: question.explanation,
      difficulty: question.difficulty?.id || '',
      category: question.category?.id || '',
      topic: question.topicId || '',
      options: question.options.map(opt => ({
        text: opt.text,
        isCorrect: opt.isCorrect
      }))
    };
    
    setEditingQuestion(question);
    setFormData(newFormData);
    
    if (question.category?.id) {
      await fetchTopicsByCategory(question.category.id);
    }
    
    setIsDialogOpen(true);
  };

  const handleDelete = async (questionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/questions/${questionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchData();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        alert(`Erro ${response.status}: ${errorData.message || 'Erro ao excluir pergunta'}`);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Erro de conexão: Não foi possível excluir a pergunta');
    }
  };

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const newOptions = [...formData.options];
    if (field === 'isCorrect' && value === true) {
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value };
    }
    setFormData({ ...formData, options: newOptions });
  };

  const getDifficultyColor = (difficulty: Difficulty | string) => {
    const difficultyName = typeof difficulty === 'string' ? difficulty : difficulty?.name;
    switch (difficultyName) {
      case 'Fácil': return 'bg-green-100 text-green-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-800';
      case 'Difícil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Falha ao acessar</h1>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              {error.message}
            </p>
            
            <Button 
              onClick={() => setLocation('/')} 
              className="mt-4 w-full"
              variant="outline"
            >
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token && !isLoading) {
    setLocation('/');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600 mt-2">Gerencie as perguntas do QuizQuest</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Pergunta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingQuestion ? 'Editar Pergunta' : 'Nova Pergunta'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pergunta *
                    </label>
                    <Textarea
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      placeholder="Digite a pergunta..."
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria *
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tópico *
                    </label>
                    <Select
                      value={formData.topic}
                      onValueChange={(value) => setFormData({ ...formData, topic: value })}
                      disabled={!formData.category || availableTopics.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !formData.category 
                            ? "Selecione uma categoria primeiro" 
                            : availableTopics.length === 0 
                              ? "Nenhum tópico disponível" 
                              : "Selecione um tópico"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTopics.map((topic) => (
                          <SelectItem key={topic.id} value={topic.id}>
                            {topic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dificuldade *
                    </label>

                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) => 
                        setFormData({ ...formData, difficulty: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a dificuldade" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map((difficulty) => (
                          <SelectItem key={difficulty.id} value={difficulty.id}>
                            {difficulty.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explicação *
                    </label>
                    <Textarea
                      value={formData.explanation}
                      onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                      placeholder="Explicação da resposta correta..."
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Opções de Resposta (marque a correta)
                  </label>
                  <div className="space-y-3">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="correct-option"
                          checked={option.isCorrect}
                          onChange={() => handleOptionChange(index, 'isCorrect', true)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <Input
                          value={option.text}
                          onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                          placeholder={`Opção ${index + 1}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingQuestion ? 'Atualizar' : 'Criar'} Pergunta
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="questions">Perguntas ({questions.length})</TabsTrigger>
            <TabsTrigger value="categories">Categorias ({categories.length})</TabsTrigger>
            <TabsTrigger value="topics">Tópicos ({topics.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-4">
            {questions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500 text-lg">Nenhuma pergunta cadastrada</p>
                  <p className="text-gray-400 mt-2">Clique em "Nova Pergunta" para começar</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {questions.map((question) => (
                  <Card key={question.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-6 mb-2">
                            {question.question}
                          </CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty?.name || 'Sem dificuldade'}
                            </Badge>
                            <Badge variant="outline">
                              {question.category?.name || 'Sem categoria'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(question.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Opções:</p>
                          <div className="space-y-1">
                            {question.options.map((option) => (
                              <div key={option.id} className="flex items-center text-sm">
                                <span className={`w-2 h-2 rounded-full mr-2 ${
                                  option.isCorrect ? 'bg-green-500' : 'bg-gray-300'
                                }`}></span>
                                <span className={option.isCorrect ? 'font-medium text-green-700' : 'text-gray-600'}>
                                  {option.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Explicação:</p>
                          <p className="text-sm text-gray-600">{question.explanation}</p>
                        </div>
                        <div className="text-xs text-gray-400">
                          Criada em: {new Date(question.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Gerenciar Categorias</h3>
              <Button 
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryFormData({});
                  setIsCategoryDialogOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Categoria
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {categories.map((category) => {
                const status = getCategoryStatus(category);
                const isEditing = editingCategory === category.id;
                
                return (
                  <Card key={category.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: category.color || '#6B7280' }}
                          >
                            {category.name.charAt(0)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                            <p className="text-sm text-gray-600">Ordem: {category.order}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {status === 'available' && (
                            <Badge className="bg-green-500 text-white">
                              <Unlock className="w-3 h-3 mr-1" />
                              Disponível
                            </Badge>
                          )}
                          {status === 'coming-soon' && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                              <Calendar className="w-3 h-3 mr-1" />
                              Em breve
                            </Badge>
                          )}
                          {status === 'inactive' && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                              <Lock className="w-3 h-3 mr-1" />
                              Inativa
                            </Badge>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditingCategory(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        {category.description}
                      </p>

                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <Calendar className="w-4 h-4 inline mr-2" />
                          {formatDate(category.availableFrom)}
                        </div>
                        <div>
                          Perguntas: {questions.filter(q => q.category?.name === category.name).length}
                        </div>
                      </div>

                      {isEditing && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="name">Nome</Label>
                              <Input
                                id="name"
                                value={categoryFormData.name || ''}
                                onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                              />
                            </div>

                            <div>
                              <Label htmlFor="description">Descrição</Label>
                              <Textarea
                                id="description"
                                value={categoryFormData.description || ''}
                                onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                                rows={2}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="availableFrom">Data de Liberação</Label>
                                <Input
                                  type="date"
                                  id="availableFrom"
                                  value={categoryFormData.availableFrom || ''}
                                  onChange={(e) => setCategoryFormData({...categoryFormData, availableFrom: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="order">Ordem</Label>
                                <Input
                                  type="number"
                                  id="order"
                                  value={categoryFormData.order || 0}
                                  onChange={(e) => setCategoryFormData({...categoryFormData, order: parseInt(e.target.value)})}
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="color">Cor (hex)</Label>
                              <Input
                                id="color"
                                value={categoryFormData.color || ''}
                                onChange={(e) => setCategoryFormData({...categoryFormData, color: e.target.value})}
                                placeholder="#F7DF1E"
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id="isActive"
                                checked={categoryFormData.isActive || false}
                                onCheckedChange={(checked) => setCategoryFormData({...categoryFormData, isActive: checked})}
                              />
                              <Label htmlFor="isActive">Categoria ativa</Label>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-3 border-t">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setEditingCategory(null)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleSaveCategory(category.id)}
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Salvar
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Topics Tab */}
          <TabsContent value="topics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Gerenciar Tópicos</h3>
              <Button 
                onClick={() => {
                  setEditingTopic(null);
                  setTopicFormData({});
                  setIsTopicDialogOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Tópico
              </Button>
            </div>

            {topics.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500 text-lg">Nenhum tópico cadastrado</p>
                  <p className="text-gray-400 mt-2">Clique em "Novo Tópico" para começar</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {topics.map((topic) => (
                  <Card key={topic.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold">{topic.name}</h4>
                            <Badge variant="outline">
                              {categories.find(c => c.id === topic.categoryId)?.name || 'Categoria não encontrada'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{topic.description}</p>
                          <div className="text-sm text-gray-500">
                            Ordem: {topic.order} | Criado em: {new Date(topic.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditingTopic(topic)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDeleteTopic(topic.id, topic.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modal for Topic Creation/Edit */}
        <Dialog open={isTopicDialogOpen} onOpenChange={setIsTopicDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTopic ? 'Editar Tópico' : 'Novo Tópico'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic-name">Nome *</Label>
                <Input
                  id="topic-name"
                  value={topicFormData.name || ''}
                  onChange={(e) => setTopicFormData({ ...topicFormData, name: e.target.value })}
                  placeholder="Digite o nome do tópico"
                />
              </div>
              
              <div>
                <Label htmlFor="topic-description">Descrição</Label>
                <Textarea
                  id="topic-description"
                  value={topicFormData.description || ''}
                  onChange={(e) => setTopicFormData({ ...topicFormData, description: e.target.value })}
                  placeholder="Digite a descrição do tópico"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="topic-category">Categoria *</Label>
                <Select
                  value={topicFormData.categoryId || ''}
                  onValueChange={(value) => setTopicFormData({ ...topicFormData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="topic-icon">Ícone</Label>
                  <Input
                    id="topic-icon"
                    value={topicFormData.icon || ''}
                    onChange={(e) => setTopicFormData({ ...topicFormData, icon: e.target.value })}
                    placeholder="Ex: code, database"
                  />
                </div>
                
                <div>
                  <Label htmlFor="topic-color">Cor (hex)</Label>
                  <Input
                    id="topic-color"
                    value={topicFormData.color || ''}
                    onChange={(e) => setTopicFormData({ ...topicFormData, color: e.target.value })}
                    placeholder="#3178C6"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="topic-order">Ordem</Label>
                <Input
                  id="topic-order"
                  type="number"
                  value={topicFormData.order || ''}
                  onChange={(e) => setTopicFormData({ ...topicFormData, order: parseInt(e.target.value) || 0 })}
                  placeholder="1"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsTopicDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={editingTopic ? () => handleUpdateTopic(editingTopic) : handleCreateTopic}
              >
                {editingTopic ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal for Category Creation/Edit */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Nome *</Label>
                <Input
                  id="category-name"
                  value={categoryFormData.name || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  placeholder="Digite o nome da categoria"
                />
              </div>
              
              <div>
                <Label htmlFor="category-description">Descrição</Label>
                <Textarea
                  id="category-description"
                  value={categoryFormData.description || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  placeholder="Digite a descrição da categoria"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category-color">Cor (hex)</Label>
                  <Input
                    id="category-color"
                    value={categoryFormData.color || ''}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                    placeholder="#3178C6"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category-order">Ordem</Label>
                  <Input
                    id="category-order"
                    type="number"
                    value={categoryFormData.order || ''}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, order: parseInt(e.target.value) || 0 })}
                    placeholder="1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category-available-from">Disponível a partir de</Label>
                <Input
                  id="category-available-from"
                  type="date"
                  value={categoryFormData.availableFrom || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, availableFrom: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="category-active"
                  checked={categoryFormData.isActive !== false}
                  onCheckedChange={(checked) => setCategoryFormData({ ...categoryFormData, isActive: checked })}
                />
                <Label htmlFor="category-active">Categoria ativa</Label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsCategoryDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={editingCategory ? () => handleSaveCategory(editingCategory) : handleCreateCategory}
              >
                {editingCategory ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
