import React, { useState } from 'react';

import { Alert, Spinner } from '@patternfly/react-core';
import { FormGroup } from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';

import { useAppDispatch } from '../../../../../store/hooks';
import { useGetSourceListQuery } from '../../../../../store/provisioningApi';
import {
  changeAwsSource,
  resetAwsSource,
} from '../../../../../store/wizardSlice';

import { V1ListSourceResponseItem } from '.';

type AwsSourcesSelectPropTypes = {
  source: V1ListSourceResponseItem | undefined;
  setSource: React.Dispatch<
    React.SetStateAction<V1ListSourceResponseItem | undefined>
  >;
};

export const AwsSourcesSelect = ({
  source,
  setSource,
}: AwsSourcesSelectPropTypes) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const { data, isFetching, isLoading, isSuccess, isError, refetch } =
    useGetSourceListQuery({
      provider: 'aws',
    });

  const sources = data?.data;

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent>,
    value: string
  ) => {
    const source = sources?.find((source) => source.name === value);
    setSource(source);
    source?.id && dispatch(changeAwsSource(source.id));
    setIsOpen(false);
  };

  const handleClear = () => {
    dispatch(resetAwsSource());
    setSource(undefined);
  };

  const handleToggle = () => {
    // Refetch upon opening (but not upon closing)
    if (!isOpen) {
      refetch();
    }

    setIsOpen(!isOpen);
  };

  const selectOptions = sources?.map((source) => (
    <SelectOption key={source.id} value={source.name} />
  ));

  const loadingSpinner = (
    <SelectOption key={'fetching'} isNoResultsOption={true}>
      <Spinner size="lg" />
    </SelectOption>
  );

  if (isFetching) {
    selectOptions?.push(loadingSpinner);
  }

  return (
    <>
      <FormGroup isRequired label={'Source Name'} data-testid="sources">
        <Select
          ouiaId="source_select"
          variant={SelectVariant.typeahead}
          onToggle={handleToggle}
          onSelect={handleSelect}
          onClear={handleClear}
          selections={source?.name}
          isOpen={isOpen}
          placeholderText="Select source"
          typeAheadAriaLabel="Select source"
          isDisabled={!isSuccess || isLoading}
        >
          {selectOptions}
        </Select>
      </FormGroup>
      <>
        {isError && (
          <Alert
            variant={'danger'}
            isPlain={true}
            isInline={true}
            title={'Sources unavailable'}
          >
            Sources cannot be reached, try again later or enter an AWS account
            ID manually.
          </Alert>
        )}
      </>
    </>
  );
};