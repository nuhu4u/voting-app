import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Select, Input } from '@/components/ui';
import { useElectionStore } from '@/store/election-store';
import { ElectionType, ElectionStatus } from '@/types/election';
import { ELECTION_TYPES, ELECTION_STATUSES, ELECTION_FILTERS } from '@/constants/election';

interface ElectionFiltersProps {
  className?: string;
}

export function ElectionFilters({ className }: ElectionFiltersProps) {
  const { filters, setFilters, clearFilters } = useElectionStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setIsModalOpen(false);
  };

  const handleClearFilters = () => {
    setTempFilters({});
    clearFilters();
    setIsModalOpen(false);
  };

  const handleResetFilters = () => {
    setTempFilters(filters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== undefined).length;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  return (
    <View {...(className && { className })}>
      <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center space-x-2">
          <Ionicons name="filter" size={20} color="#6b7280" />
          <Text className="text-gray-700 font-medium">Filters</Text>
          {hasActiveFilters && (
            <View className="bg-blue-500 rounded-full w-6 h-6 items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {getActiveFiltersCount()}
              </Text>
            </View>
          )}
        </View>
        
        <View className="flex-row space-x-2">
          {hasActiveFilters && (
            <Button
              onPress={handleClearFilters}
              variant="outline"
              size="sm"
            >
              Clear
            </Button>
          )}
          
          <Button
            onPress={() => setIsModalOpen(true)}
            variant="outline"
            size="sm"
          >
            <Ionicons name="options" size={16} color="#6b7280" />
          </Button>
        </View>
      </View>

      {/* Quick Filters */}
      <View className="p-4 bg-gray-50">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-2">
            {ELECTION_STATUSES.map((status) => (
              <Pressable
                key={status.value}
                onPress={() => {
                  const newFilters = { ...filters };
                  if (filters.status === status.value) {
                    delete newFilters.status;
                  } else {
                    newFilters.status = status.value;
                  }
                  setFilters(newFilters);
                }}
                className={`px-3 py-2 rounded-full border ${
                  filters.status === status.value
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    filters.status === status.value
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {status.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-end">
          <View className="bg-white w-full max-h-3/4 rounded-t-xl">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                Filter Elections
              </Text>
              <Pressable onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>

            <ScrollView className="p-4">
              <View className="space-y-4">
                {/* Search */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Search
                  </Text>
                  <Input
                    placeholder="Search elections..."
                    value={tempFilters.search || ''}
                    onChangeText={(text) => setTempFilters(prev => ({ ...prev, search: text }))}
                    leftIcon="search"
                  />
                </View>

                {/* State Filter */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    State
                  </Text>
                  <Select
                    placeholder="Select state"
                    options={ELECTION_FILTERS.states.map(state => ({ value: state, label: state }))}
                    value={tempFilters.state || ''}
                    onValueChange={(value) => setTempFilters(prev => ({ ...prev, state: value }))}
                  />
                </View>

                {/* Election Type Filter */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Election Type
                  </Text>
                  <Select
                    placeholder="Select type"
                    options={ELECTION_TYPES.map(type => ({ value: type.value, label: type.label }))}
                    value={tempFilters.type || ''}
                    onValueChange={(value) => setTempFilters(prev => ({ ...prev, type: value as ElectionType }))}
                  />
                </View>

                {/* Status Filter */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Status
                  </Text>
                  <Select
                    placeholder="Select status"
                    options={ELECTION_STATUSES.map(status => ({ value: status.value, label: status.label }))}
                    value={tempFilters.status || ''}
                    onValueChange={(value) => setTempFilters(prev => ({ ...prev, status: value as ElectionStatus }))}
                  />
                </View>
              </View>
            </ScrollView>

            <View className="flex-row space-x-3 p-4 border-t border-gray-200">
              <Button
                onPress={handleResetFilters}
                variant="outline"
                className="flex-1"
              >
                Reset
              </Button>
              <Button
                onPress={handleApplyFilters}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

interface ElectionSearchProps {
  className?: string;
}

export function ElectionSearch({ className }: ElectionSearchProps) {
  const { filters, setFilters } = useElectionStore();
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters({ ...filters, search: query });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    const newFilters = { ...filters };
    delete newFilters.search;
    setFilters(newFilters);
  };

  return (
    <View className={`p-4 bg-white border-b border-gray-200 ${className}`}>
      <View className="flex-row items-center space-x-3">
        <View className="flex-1">
          <Input
            placeholder="Search elections..."
            value={searchQuery}
            onChangeText={handleSearch}
            leftIcon="search"
            {...(searchQuery && { rightIcon: "close" })}
            onRightIconPress={handleClearSearch}
          />
        </View>
        
        <Button
          onPress={() => setFilters({ ...filters, search: searchQuery })}
          variant="outline"
          size="sm"
        >
          <Ionicons name="search" size={16} color="#6b7280" />
        </Button>
      </View>
    </View>
  );
}

interface ElectionSortProps {
  className?: string;
}

export function ElectionSort({ className }: ElectionSortProps) {
  const { filters, setFilters } = useElectionStore();

  const sortOptions = [
    { value: 'start_date', label: 'Start Date' },
    { value: 'end_date', label: 'End Date' },
    { value: 'title', label: 'Title' },
    { value: 'total_votes', label: 'Votes' },
    { value: 'created_at', label: 'Created' },
  ];

  const handleSortChange = (value: string) => {
    setFilters({ ...filters, sortBy: value as any });
  };

  return (
    <View className={`p-4 bg-white border-b border-gray-200 ${className}`}>
      <View className="flex-row items-center space-x-3">
        <Ionicons name="swap-vertical" size={20} color="#6b7280" />
        <Text className="text-gray-700 font-medium">Sort by:</Text>
        
        <View className="flex-1">
          <Select
            placeholder="Select sort option"
            options={sortOptions}
            value={filters.sortBy || ''}
            onValueChange={handleSortChange}
          />
        </View>
      </View>
    </View>
  );
}
